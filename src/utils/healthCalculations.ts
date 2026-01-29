// BMI Calculator
export function calculateBMI(weight: number, height: number): {
    bmi: number;
    category: string;
    description: string;
    color: string;
} {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    let category = '';
    let description = '';
    let color = '';

    if (bmi < 18.5) {
        category = 'Kurus';
        description = 'Berat badan Anda kurang dari normal. Disarankan untuk meningkatkan asupan nutrisi.';
        color = 'text-blue-600';
    } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal';
        description = 'Berat badan Anda ideal. Pertahankan pola hidup sehat Anda!';
        color = 'text-green-600';
    } else if (bmi >= 25 && bmi < 30) {
        category = 'Kelebihan Berat Badan';
        description = 'Berat badan Anda sedikit berlebih. Disarankan untuk diet seimbang dan olahraga teratur.';
        color = 'text-yellow-600';
    } else {
        category = 'Obesitas';
        description = 'Berat badan Anda berlebih. Sangat disarankan untuk konsultasi dengan dokter.';
        color = 'text-red-600';
    }

    return { bmi: parseFloat(bmi.toFixed(1)), category, description, color };
}

// Calorie Calculator (TDEE - Total Daily Energy Expenditure)
export function calculateCalories(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    activityLevel: string
): {
    bmr: number;
    tdee: number;
    maintain: number;
    mildLoss: number;
    weightLoss: number;
    mildGain: number;
    weightGain: number;
} {
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,      // Little or no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Hard exercise 6-7 days/week
        veryActive: 1.9      // Very hard exercise & physical job
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    const tdee = bmr * multiplier;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        maintain: Math.round(tdee),
        mildLoss: Math.round(tdee - 250),      // 0.25 kg/week
        weightLoss: Math.round(tdee - 500),    // 0.5 kg/week
        mildGain: Math.round(tdee + 250),      // 0.25 kg/week
        weightGain: Math.round(tdee + 500)     // 0.5 kg/week
    };
}

// Pregnancy Calculator
export function calculatePregnancy(lmpDate: Date): {
    currentWeeks: number;
    currentDays: number;
    trimester: number;
    dueDate: Date;
    conceptionDate: Date;
    daysRemaining: number;
} {
    const today = new Date();
    const lmp = new Date(lmpDate);

    // Calculate days since LMP
    const daysSinceLMP = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate current pregnancy age
    const currentWeeks = Math.floor(daysSinceLMP / 7);
    const currentDays = daysSinceLMP % 7;

    // Determine trimester
    let trimester = 1;
    if (currentWeeks >= 28) trimester = 3;
    else if (currentWeeks >= 14) trimester = 2;

    // Calculate due date (280 days from LMP)
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + 280);

    // Calculate conception date (approximately 14 days after LMP)
    const conceptionDate = new Date(lmp);
    conceptionDate.setDate(conceptionDate.getDate() + 14);

    // Days remaining
    const daysRemaining = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
        currentWeeks,
        currentDays,
        trimester,
        dueDate,
        conceptionDate,
        daysRemaining
    };
}

// Ideal Weight Calculator
export function calculateIdealWeight(height: number, gender: 'male' | 'female'): {
    broca: number;
    devine: number;
    robinson: number;
    miller: number;
    average: number;
} {
    const heightInCm = height;
    const heightInInches = heightInCm / 2.54;

    // Broca Formula (simple)
    const broca = heightInCm - 100 - ((heightInCm - 100) * 0.1);

    // Devine Formula
    let devine: number;
    if (gender === 'male') {
        devine = 50 + 2.3 * (heightInInches - 60);
    } else {
        devine = 45.5 + 2.3 * (heightInInches - 60);
    }

    // Robinson Formula
    let robinson: number;
    if (gender === 'male') {
        robinson = 52 + 1.9 * (heightInInches - 60);
    } else {
        robinson = 49 + 1.7 * (heightInInches - 60);
    }

    // Miller Formula
    let miller: number;
    if (gender === 'male') {
        miller = 56.2 + 1.41 * (heightInInches - 60);
    } else {
        miller = 53.1 + 1.36 * (heightInInches - 60);
    }

    const average = (broca + devine + robinson + miller) / 4;

    return {
        broca: parseFloat(broca.toFixed(1)),
        devine: parseFloat(devine.toFixed(1)),
        robinson: parseFloat(robinson.toFixed(1)),
        miller: parseFloat(miller.toFixed(1)),
        average: parseFloat(average.toFixed(1))
    };
}

// Water Intake Calculator
export function calculateWaterIntake(weight: number, activityLevel: string): {
    basic: number;
    withActivity: number;
    recommendation: string;
} {
    // Basic formula: 30-35 ml per kg body weight
    const basic = (weight * 33) / 1000; // in liters

    // Activity adjustments
    const activityAdjustments: Record<string, number> = {
        sedentary: 0,
        light: 0.5,
        moderate: 1,
        active: 1.5,
        veryActive: 2
    };

    const adjustment = activityAdjustments[activityLevel] || 0;
    const withActivity = basic + adjustment;

    let recommendation = '';
    if (withActivity < 2) {
        recommendation = 'Tingkatkan asupan air Anda untuk kesehatan optimal.';
    } else if (withActivity >= 2 && withActivity <= 3) {
        recommendation = 'Asupan air Anda sudah baik. Pertahankan!';
    } else {
        recommendation = 'Pastikan Anda minum air secara bertahap sepanjang hari.';
    }

    return {
        basic: parseFloat(basic.toFixed(1)),
        withActivity: parseFloat(withActivity.toFixed(1)),
        recommendation
    };
}

// Heart Rate Calculator
export function calculateHeartRate(age: number): {
    maxHeartRate: number;
    restingHeartRate: { min: number; max: number };
    moderateZone: { min: number; max: number };
    vigorousZone: { min: number; max: number };
    peakZone: { min: number; max: number };
} {
    // Maximum Heart Rate (220 - age)
    const maxHeartRate = 220 - age;

    // Resting heart rate (normal range)
    const restingHeartRate = { min: 60, max: 100 };

    // Exercise zones
    const moderateZone = {
        min: Math.round(maxHeartRate * 0.5),
        max: Math.round(maxHeartRate * 0.7)
    };

    const vigorousZone = {
        min: Math.round(maxHeartRate * 0.7),
        max: Math.round(maxHeartRate * 0.85)
    };

    const peakZone = {
        min: Math.round(maxHeartRate * 0.85),
        max: Math.round(maxHeartRate * 0.95)
    };

    return {
        maxHeartRate,
        restingHeartRate,
        moderateZone,
        vigorousZone,
        peakZone
    };
}
