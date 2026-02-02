import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const getQuestions = async (req, res, next) => {
    try {
        const questions = await prisma.surveyQuestion.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return successResponse(res, questions);
    } catch (error) {
        next(error);
    }
};

export const submitSurvey = async (req, res, next) => {
    try {
        const { serviceType, ratings, comments, respondentName, department, recommendation } = req.body;
        const userId = req.user?.id;

        const survey = await prisma.survey.create({
            data: {
                userId,
                serviceType,
                ratings,
                comments,
                respondentName,
                department,
                recommendation
            },
        });

        return successResponse(res, survey, 'Survey submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getSurveyStats = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query; // week, month, quarter, year

        // Date Logic
        const now = new Date();
        let startDate = new Date();
        if (period === 'week') startDate.setDate(now.getDate() - 7);
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
        else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);
        else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

        // 1. Fetch Surveys
        const surveys = await prisma.survey.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Calculate Stats manually (JSON fields are hard to aggregate in DB directly without Raw SQL)
        let totalResponses = surveys.length;
        let totalScoreSum = 0;

        // Recommendation Counts
        const recommendationCounts = { YES: 0, MAYBE: 0, NO: 0 };

        // Category Sums
        const categorySums = { facilities: 0, service: 0, cleanliness: 0, waitTime: 0, overall: 0 };

        // Department Stats
        const departmentStats = {};

        // Monthly Trend Data
        const monthlyData = {};

        surveys.forEach(survey => {
            // Ratings Parsing
            const r = survey.ratings || {};
            const avg = (parseFloat(r.overall) || 0);
            totalScoreSum += avg;

            categorySums.facilities += (parseFloat(r.facilities) || 0);
            categorySums.service += (parseFloat(r.service) || 0);
            categorySums.cleanliness += (parseFloat(r.cleanliness) || 0);
            categorySums.waitTime += (parseFloat(r.waitTime) || 0);
            categorySums.overall += avg;

            // Recommendation
            if (survey.recommendation) {
                recommendationCounts[survey.recommendation] = (recommendationCounts[survey.recommendation] || 0) + 1;
            }

            // Department
            const dept = survey.department || 'Umum';
            if (!departmentStats[dept]) departmentStats[dept] = { scoreSum: 0, count: 0 };
            departmentStats[dept].scoreSum += avg;
            departmentStats[dept].count += 1;

            // Monthly Trend
            const monthKey = new Date(survey.createdAt).toLocaleString('default', { month: 'short' });
            if (!monthlyData[monthKey]) monthlyData[monthKey] = { scoreSum: 0, count: 0 };
            monthlyData[monthKey].scoreSum += avg;
            monthlyData[monthKey].count += 1;
        });

        const averageScore = totalResponses > 0 ? (totalScoreSum / totalResponses).toFixed(2) : 0;

        // Format for Frontend
        const stats = {
            totalResponses,
            averageScore,
            recommendationData: [
                { name: "Ya", value: totalResponses ? Math.round((recommendationCounts.YES / totalResponses) * 100) : 0, color: "#22c55e" },
                { name: "Mungkin", value: totalResponses ? Math.round((recommendationCounts.MAYBE / totalResponses) * 100) : 0, color: "#eab308" },
                { name: "Tidak", value: totalResponses ? Math.round((recommendationCounts.NO / totalResponses) * 100) : 0, color: "#ef4444" },
            ],
            categoryScores: Object.keys(categorySums).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                score: totalResponses > 0 ? (categorySums[key] / totalResponses).toFixed(1) : 0
            })),
            departmentScores: Object.keys(departmentStats).map(key => ({
                department: key,
                score: (departmentStats[key].scoreSum / departmentStats[key].count).toFixed(1),
                responses: departmentStats[key].count
            })),
            monthlyTrend: Object.keys(monthlyData).map(key => ({
                month: key,
                score: (monthlyData[key].scoreSum / monthlyData[key].count).toFixed(1),
                responses: monthlyData[key].count
            })),
            recentResponses: surveys.slice(0, 5)
        };

        return successResponse(res, stats);
    } catch (error) {
        next(error);
    }
};
