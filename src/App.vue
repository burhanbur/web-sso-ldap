<template>
    <router-view />
</template>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
    }

    #app {
        min-height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    /* Prevent zoom on mobile when focusing inputs */
    @media (max-width: 768px) {
        input[type="text"],
        input[type="password"],
        input[type="email"],
        input[type="number"],
        input[type="search"],
        input[type="tel"],
        input[type="url"] {
            font-size: 16px;
        }
    }

    :root {
        --primary-color: #007bff;
        --danger-color: #dc3545;
        --success-color: #28a745;
        --gray-color: #6c757d;
    }

    body {
        line-height: 1.6;
        color: #333;
    }

    button {
        cursor: pointer;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        font-size: 1rem;
    }

    button.delete {
        background-color: var(--danger-color);
    }

    .loading {
        color: var(--gray-color);
        text-align: center;
        padding: 2rem;
    }

    h1 {
        margin-bottom: 1.5rem;
        color: #2c3e50;
    }

    input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    th, td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f8f9fa;
        font-weight: 600;
    }
</style>
