require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./modal/Doctor');

const doctors = [
    {
        name: 'Dr. Anjali Sharma',
        email: 'anjali.sharma@medicare.com',
        password: 'doctor123',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
        specialization: 'General Physician',
        category: ['Primary Care', 'Wellness'],
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: 12,
        about: 'Dr. Anjali Sharma is a dedicated General Physician with over 12 years of clinical experience. She specializes in preventive healthcare, chronic disease management, and routine health check-ups.',
        fees: 500,
        hospitalInfo: {
            name: 'Apollo Hospital',
            address: '21 Greams Lane',
            city: 'Mumbai',
        },
        availabilityRange: {
            startDate: '2026-02-25',
            endDate: '2026-06-30',
            excludedWeekdays: [0], // Sunday off
        },
        dailyTimeRanges: [
            { start: '09:00', end: '13:00' },
            { start: '16:00', end: '19:00' },
        ],
        slotDurationMinutes: 30,
        isVerified: true,
        isActive: true,
    },
    {
        name: 'Dr. Rajesh Patel',
        email: 'rajesh.patel@medicare.com',
        password: 'doctor123',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        specialization: 'Cardiologist',
        category: ['Manage Your Condition', 'Senior Health'],
        qualification: 'MBBS, DM (Cardiology)',
        experience: 18,
        about: 'Dr. Rajesh Patel is a renowned Cardiologist with 18 years of experience in interventional cardiology. He has performed over 5000 cardiac procedures and is known for his patient-centric approach.',
        fees: 1200,
        hospitalInfo: {
            name: 'Fortis Heart Institute',
            address: 'Sector 62',
            city: 'Delhi',
        },
        availabilityRange: {
            startDate: '2026-02-25',
            endDate: '2026-06-30',
            excludedWeekdays: [0, 6], // Sat, Sun off
        },
        dailyTimeRanges: [
            { start: '10:00', end: '14:00' },
            { start: '17:00', end: '20:00' },
        ],
        slotDurationMinutes: 30,
        isVerified: true,
        isActive: true,
    },
    {
        name: 'Dr. Priya Menon',
        email: 'priya.menon@medicare.com',
        password: 'doctor123',
        profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
        specialization: 'Dermatologist',
        category: ['Wellness', "Women's Health"],
        qualification: 'MBBS, MD (Dermatology)',
        experience: 8,
        about: 'Dr. Priya Menon is a skilled Dermatologist specializing in cosmetic dermatology, acne treatment, and skin allergy management. She combines modern techniques with holistic care.',
        fees: 800,
        hospitalInfo: {
            name: 'Skin Care Clinic',
            address: 'MG Road',
            city: 'Bangalore',
        },
        availabilityRange: {
            startDate: '2026-02-25',
            endDate: '2026-06-30',
            excludedWeekdays: [0],
        },
        dailyTimeRanges: [
            { start: '09:30', end: '13:30' },
            { start: '15:00', end: '18:00' },
        ],
        slotDurationMinutes: 20,
        isVerified: true,
        isActive: true,
    },
    {
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@medicare.com',
        password: 'doctor123',
        profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
        specialization: 'Pediatrician',
        category: ["Children's Health", 'Primary Care'],
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 15,
        about: 'Dr. Vikram Singh is a compassionate Pediatrician with 15 years of experience in child healthcare. He specializes in neonatal care, childhood vaccinations, and developmental pediatrics.',
        fees: 600,
        hospitalInfo: {
            name: 'Rainbow Children Hospital',
            address: 'Banjara Hills',
            city: 'Hyderabad',
        },
        availabilityRange: {
            startDate: '2026-02-25',
            endDate: '2026-06-30',
            excludedWeekdays: [0],
        },
        dailyTimeRanges: [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '17:00' },
        ],
        slotDurationMinutes: 30,
        isVerified: true,
        isActive: true,
    },
    {
        name: 'Dr. Neha Gupta',
        email: 'neha.gupta@medicare.com',
        password: 'doctor123',
        profileImage: 'https://randomuser.me/api/portraits/women/26.jpg',
        specialization: 'Psychiatrist',
        category: ['Mental & Behavioral Health', 'Wellness'],
        qualification: 'MBBS, MD (Psychiatry)',
        experience: 10,
        about: 'Dr. Neha Gupta is a compassionate Psychiatrist specializing in anxiety disorders, depression, and stress management. She uses a combination of therapy and medication for holistic mental health care.',
        fees: 900,
        hospitalInfo: {
            name: 'NIMHANS',
            address: 'Hosur Road',
            city: 'Bangalore',
        },
        availabilityRange: {
            startDate: '2026-02-25',
            endDate: '2026-06-30',
            excludedWeekdays: [0, 6],
        },
        dailyTimeRanges: [
            { start: '10:00', end: '13:00' },
            { start: '15:00', end: '18:00' },
        ],
        slotDurationMinutes: 45,
        isVerified: true,
        isActive: true,
    },
];

async function seedDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const doc of doctors) {
            const exists = await Doctor.findOne({ email: doc.email });
            if (exists) {
                console.log(`Doctor already exists: ${doc.name} (${doc.email}) — skipping`);
                continue;
            }
            const hashed = await bcrypt.hash(doc.password, 12);
            await Doctor.create({ ...doc, password: hashed });
            console.log(`Created doctor: ${doc.name} (${doc.specialization})`);
        }

        console.log('\nDone! All dummy doctors seeded.');
        console.log('\nLogin credentials for all doctors:');
        console.log('Password: doctor123');
        console.log('Emails:');
        doctors.forEach(d => console.log(`  - ${d.email}`));

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDoctors();
