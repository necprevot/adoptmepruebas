import { createHash } from './index.js';
import { faker } from '@faker-js/faker';

// Configura faker en español
faker.locale = 'es';

// Función para generar un rol aleatorio
const getRandomRole = () => {
    return Math.random() > 0.5 ? 'user' : 'admin';
};

// Generar usuarios mock
export const generateMockUsers = async (num) => {
    const users = [];
    const hashedPassword = await createHash('coder123');
    
    for (let i = 0; i < num; i++) {
        const firstName = getRandomName();
        const lastName = getRandomLastName();
        
        users.push({
            first_name: firstName,
            last_name: lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@test.com`,
            password: hashedPassword,
            role: getRandomRole(),
            pets: []
        });
    }
    
    return users;
};

// Generar mascotas mock
export const generateMockPets = (num) => {
    const pets = [];
    
    for (let i = 0; i < num; i++) {
        pets.push({
            name: getRandomPetName(),
            specie: getRandomSpecie(),
            birthDate: getRandomBirthDate(),
            adopted: false,
            image: ''
        });
    }
    
    return pets;
};