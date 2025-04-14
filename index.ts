// Hello World program in TypeScript

function sayHello(name: string = "World"): string {
    return `Hello, ${name}!`;
}

// Print hello message to console
console.log(sayHello());

// Export the function for potential use in other modules
export { sayHello };