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
        const { serviceType, ratings, comments } = req.body;
        const userId = req.user?.id;

        const survey = await prisma.survey.create({
            data: { userId, serviceType, ratings, comments },
        });

        return successResponse(res, survey, 'Survey submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};
