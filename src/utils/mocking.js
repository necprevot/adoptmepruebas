import { createHash } from './index.js';
import { faker } from '@faker-js/faker';

// Configura faker en español
faker.locale = 'es';

// Función para generar un rol aleatorio
const getRandomRole = () => {
    return Math.random() > 0.5 ? 'user' : 'admin';
};

// Función para generar nombre aleatorio
const getRandomName = () => {
    return faker.person.firstName();
};

// Función para generar apellido aleatorio
const getRandomLastName = () => {
    return faker.person.lastName();
};

// Función para generar nombre de mascota aleatorio
const getRandomPetName = () => {
    const petNames = [
        'Max', 'Luna', 'Charlie', 'Bella', 'Rocky', 'Daisy',
        'Cooper', 'Lucy', 'Buddy', 'Molly', 'Duke', 'Sadie',
        'Zeus', 'Coco', 'Leo', 'Nala', 'Simba', 'Mia',
        'Thor', 'Lola', 'Toby', 'Chloe', 'Bear', 'Sophie',
        'Jack', 'Zoe', 'Oliver', 'Lily', 'Tucker', 'Penny'
    ];
    return petNames[Math.floor(Math.random() * petNames.length)];
};

// Función para generar especie aleatoria
const getRandomSpecie = () => {
    const species = ['dog', 'cat', 'bird', 'hamster', 'rabbit'];
    return species[Math.floor(Math.random() * species.length)];
};

// Función para generar fecha de nacimiento aleatoria
const getRandomBirthDate = () => {
    // Genera una fecha entre 0 y 15 años atrás
    const years = Math.floor(Math.random() * 15);
    const months = Math.floor(Math.random() * 12);
    const days = Math.floor(Math.random() * 28);
    
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    date.setMonth(date.getMonth() - months);
    date.setDate(date.getDate() - days);
    
    return date;
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