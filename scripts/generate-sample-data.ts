import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const PROFILE_ID = 'cme1bf3w30006lgejdoy4uswe';
const DAYS_OF_DATA = 90; // 3 months of historical data

// Helper function to generate dates going back from today
function generateDateRange(days: number): Date[] {
  const dates: Date[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}

// Generate realistic weight progression (gradual loss)
function generateWeightData(dates: Date[]) {
  const startWeight = 185; // Starting weight in lbs
  const targetWeightLoss = 25; // Target loss over 3 months
  
  return dates.map((date, index) => {
    // Gradual weight loss with some natural fluctuation
    const progress = index / dates.length;
    const baseWeight = startWeight - (targetWeightLoss * progress);
    const fluctuation = faker.number.float({ min: -2, max: 1 }); // Daily fluctuation
    
    return {
      profileId: PROFILE_ID,
      weight: Math.round((baseWeight + fluctuation) * 10) / 10,
      capturedDate: date,
      createdAt: date,
    };
  });
}

// Generate blood pressure data (improving over time)
function generateBloodPressureData(dates: Date[]) {
  return dates
    .filter(() => faker.datatype.boolean(0.7)) // 70% chance of recording
    .map((date, index) => {
      // Starting with higher BP, improving over time
      const progress = index / dates.length;
      const baseSystolic = 145 - (20 * progress); // Improving from 145 to 125
      const baseDiastolic = 95 - (15 * progress); // Improving from 95 to 80
      
      const systolicVariation = faker.number.int({ min: -5, max: 5 });
      const diastolicVariation = faker.number.int({ min: -3, max: 3 });
      
      return {
        profileId: PROFILE_ID,
        systolic: Math.max(110, Math.min(160, Math.round(baseSystolic + systolicVariation))),
        diastolic: Math.max(70, Math.min(100, Math.round(baseDiastolic + diastolicVariation))),
        capturedDate: date,
        createdAt: date,
      };
    });
}

// Generate blood sugar data
function generateBloodSugarData(dates: Date[]) {
  return dates
    .filter(() => faker.datatype.boolean(0.6)) // 60% chance of recording
    .map((date) => {
      const measurementType = faker.helpers.arrayElement(['fasting', 'before_meal', 'after_meal', 'bedtime']);
      
      let baseGlucose: number;
      switch (measurementType) {
        case 'fasting':
          baseGlucose = faker.number.int({ min: 80, max: 110 });
          break;
        case 'before_meal':
          baseGlucose = faker.number.int({ min: 85, max: 120 });
          break;
        case 'after_meal':
          baseGlucose = faker.number.int({ min: 120, max: 160 });
          break;
        case 'bedtime':
          baseGlucose = faker.number.int({ min: 90, max: 130 });
          break;
        default:
          baseGlucose = faker.number.int({ min: 80, max: 140 });
      }
      
      return {
        profileId: PROFILE_ID,
        level: baseGlucose,
        measurementType,
        capturedDate: date,
        createdAt: date,
      };
    });
}

// Generate food intake data
function generateFoodIntakeData(dates: Date[]) {
  const foodItems = [
    { name: 'Grilled Chicken Salad', calories: 350 },
    { name: 'Salmon with Vegetables', calories: 420 },
    { name: 'Greek Yogurt with Berries', calories: 180 },
    { name: 'Quinoa Bowl', calories: 380 },
    { name: 'Avocado Toast', calories: 320 },
    { name: 'Protein Smoothie', calories: 250 },
    { name: 'Lean Beef Stir Fry', calories: 400 },
    { name: 'Egg White Omelet', calories: 200 },
  ];
  
  const meals: any[] = [];
  
  dates.forEach((date) => {
    // Generate 2-4 meals per day
    const mealsPerDay = faker.number.int({ min: 2, max: 4 });
    
    for (let i = 0; i < mealsPerDay; i++) {
      const mealTime = new Date(date);
      mealTime.setHours(7 + (i * 4), faker.number.int({ min: 0, max: 59 }));
      
      const food = faker.helpers.arrayElement(foodItems);
      const portionMultiplier = faker.number.float({ min: 0.8, max: 1.3 });
      
      meals.push({
        profileId: PROFILE_ID,
        food: food.name,
        calories: Math.round(food.calories * portionMultiplier),
        mealType: i === 0 ? 'breakfast' : i === 1 ? 'lunch' : i === 2 ? 'dinner' : 'snack',
        capturedDate: mealTime,
        createdAt: mealTime,
      });
    }
  });
  
  return meals;
}

// Generate activity data
function generateActivityData(dates: Date[]) {
  const activities = [
    'Walking',
    'Jogging', 
    'Swimming',
    'Cycling',
    'Yoga',
    'Weight Training',
    'Dancing',
  ];
  
  return dates
    .filter(() => faker.datatype.boolean(0.8)) // 80% chance of activity
    .map((date) => {
      const activityType = faker.helpers.arrayElement(activities);
      const duration = faker.number.int({ min: 15, max: 90 }); // 15-90 minutes
      
      const activityTime = new Date(date);
      activityTime.setHours(faker.number.int({ min: 6, max: 20 }), faker.number.int({ min: 0, max: 59 }));
      
      return {
        profileId: PROFILE_ID,
        type: activityType,
        duration,
        capturedDate: activityTime,
        createdAt: activityTime,
      };
    });
}

// Generate GLP-1 injection data
function generateGlp1Data(dates: Date[]) {
  const medications = ['Ozempic', 'Wegovy', 'Mounjaro'];
  const selectedMed = faker.helpers.arrayElement(medications);
  
  // Weekly injections (every 7 days)
  const injectionDates = dates.filter((_, index) => index % 7 === 0);
  
  return injectionDates.map((date, index) => {
    // Gradually increasing dosage over time
    let dose: number;
    if (index < 4) {
      dose = 0.25;
    } else if (index < 8) {
      dose = 0.5;
    } else {
      dose = 1.0;
    }
    
    const injectionTime = new Date(date);
    injectionTime.setHours(faker.number.int({ min: 8, max: 12 }), faker.number.int({ min: 0, max: 59 }));
    
    return {
      profileId: PROFILE_ID,
      type: selectedMed,
      dose,
      capturedDate: injectionTime,
      createdAt: injectionTime,
    };
  });
}

// Generate medication data
function generateMedicationData() {
  const medications = [
    { name: 'Metformin', dosage: 500, dosageUnit: 'MG' as const, repeatEvery: 1, repeatUnit: 'Day(s)' },
    { name: 'Lisinopril', dosage: 10, dosageUnit: 'MG' as const, repeatEvery: 1, repeatUnit: 'Day(s)' },
    { name: 'Vitamin D3', dosage: 2000, dosageUnit: 'IU' as const, repeatEvery: 1, repeatUnit: 'Day(s)' },
  ];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_OF_DATA);
  
  return medications.map((med) => ({
    profileId: PROFILE_ID,
    name: med.name,
    dosage: med.dosage,
    dosageUnit: med.dosageUnit,
    description: `${med.name} for health management`,
    status: 'active',
    startDate,
    repeatEvery: med.repeatEvery,
    repeatUnit: med.repeatUnit,
    enableReminders: true,
    createdAt: startDate,
  }));
}

// Generate journal entries
function generateJournalData(dates: Date[]) {
  const journalPrompts = [
    "Feeling great today! The medication is really helping with my appetite control.",
    "Had some mild nausea this morning, but it passed after a few hours.",
    "Noticed I'm not craving sweets as much anymore. This is a huge win!",
    "Energy levels are much better. Went for a longer walk today.",
    "Clothes are fitting better. Starting to see real progress!",
    "Had a challenging day with cravings, but stayed on track.",
    "Sleep quality has improved significantly since starting treatment.",
    "Feeling more confident about my health journey.",
    "Side effects are minimal now. Body is adjusting well.",
    "Celebrated a small victory today - down another pound!",
  ];
  
  return dates
    .filter(() => faker.datatype.boolean(0.4)) // 40% chance of journal entry
    .map((date) => {
      const entryTime = new Date(date);
      entryTime.setHours(faker.number.int({ min: 18, max: 22 }), faker.number.int({ min: 0, max: 59 }));
      
      return {
        profileId: PROFILE_ID,
        title: faker.helpers.arrayElement([
          'Daily Check-in',
          'Progress Update',
          'How I\'m Feeling',
          'Today\'s Reflection',
          'Health Journey',
        ]),
        content: faker.helpers.arrayElement(journalPrompts),
        capturedDate: entryTime,
        createdAt: entryTime,
      };
    });
}

// Generate doctor notes
function generateDoctorNotes(dates: Date[]) {
  const noteContent = `Initial Consultation: Patient started on GLP-1 therapy. Baseline weight: 185 lbs. Target weight loss: 20-30 lbs over 6 months. Discussed proper injection technique and potential side effects.

4-Week Follow-up: Patient tolerating medication well. Mild nausea initially but resolved. Weight loss of 8 lbs noted. Increased dosage to 0.5mg weekly.

8-Week Check-in: Excellent progress. Total weight loss: 15 lbs. Blood pressure improving. Patient reports increased energy and reduced appetite. Continue current regimen.

12-Week Assessment: Outstanding results. Weight loss: 22 lbs. Blood sugar levels stable. Patient very satisfied with progress. Discussed maintenance phase.`;
  
  const noteDate = new Date(dates[0]);
  
  return [{
    profileId: PROFILE_ID,
    content: noteContent,
    createdAt: noteDate,
  }];
}

async function generateSampleData() {
  console.log('🚀 Starting sample data generation...');
  
  try {
    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: PROFILE_ID },
    });
    
    if (!profile) {
      console.error('❌ Profile not found with ID:', PROFILE_ID);
      return;
    }
    
    console.log('✅ Profile found:', profile.firstName, profile.lastName);
    
    const dates = generateDateRange(DAYS_OF_DATA);
    console.log(`📅 Generating data for ${dates.length} days (${DAYS_OF_DATA} days of history)`);
    
    // Generate all data
    console.log('📊 Generating weight data...');
    const weightData = generateWeightData(dates);
    
    console.log('🩺 Generating blood pressure data...');
    const bpData = generateBloodPressureData(dates);
    
    console.log('🩸 Generating blood sugar data...');
    const bsData = generateBloodSugarData(dates);
    
    console.log('🍽️ Generating food intake data...');
    const foodData = generateFoodIntakeData(dates);
    
    console.log('🏃 Generating activity data...');
    const activityData = generateActivityData(dates);
    
    console.log('💉 Generating GLP-1 injection data...');
    const glp1Data = generateGlp1Data(dates);
    
    console.log('💊 Generating medication data...');
    const medicationData = generateMedicationData();
    
    console.log('📝 Generating journal entries...');
    const journalData = generateJournalData(dates);
    
    console.log('👨‍⚕️ Generating doctor notes...');
    const doctorNotesData = generateDoctorNotes(dates);
    
    // Insert data into database
    console.log('💾 Inserting data into database...');
    
    await prisma.weight.createMany({ data: weightData });
    console.log(`✅ Created ${weightData.length} weight entries`);
    
    await prisma.bloodPressure.createMany({ data: bpData });
    console.log(`✅ Created ${bpData.length} blood pressure entries`);
    
    await prisma.bloodSugar.createMany({ data: bsData });
    console.log(`✅ Created ${bsData.length} blood sugar entries`);
    
    await prisma.foodIntake.createMany({ data: foodData });
    console.log(`✅ Created ${foodData.length} food intake entries`);
    
    await prisma.activity.createMany({ data: activityData });
    console.log(`✅ Created ${activityData.length} activity entries`);
    
    await prisma.glp1Entry.createMany({ data: glp1Data });
    console.log(`✅ Created ${glp1Data.length} GLP-1 injection entries`);
    
    await prisma.medication.createMany({ data: medicationData });
    console.log(`✅ Created ${medicationData.length} medication entries`);
    
    await prisma.journal.createMany({ data: journalData });
    console.log(`✅ Created ${journalData.length} journal entries`);
    
    await prisma.doctorNote.createMany({ data: doctorNotesData });
    console.log(`✅ Created ${doctorNotesData.length} doctor notes`);
    
    console.log('\n🎉 Sample data generation completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   • ${weightData.length} weight measurements`);
    console.log(`   • ${bpData.length} blood pressure readings`);
    console.log(`   • ${bsData.length} blood sugar readings`);
    console.log(`   • ${foodData.length} food intake entries`);
    console.log(`   • ${activityData.length} activity sessions`);
    console.log(`   • ${glp1Data.length} GLP-1 injections`);
    console.log(`   • ${medicationData.length} medication doses`);
    console.log(`   • ${journalData.length} journal entries`);
    console.log(`   • ${doctorNotesData.length} doctor notes`);
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the generator
if (require.main === module) {
  generateSampleData();
}

export { generateSampleData };