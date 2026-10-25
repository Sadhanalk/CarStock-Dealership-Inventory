Prompt 1 – Building the project

I want to build a complete Car Dealership Inventory System based on the requirements in the provided kata document. Use FastAPI for the backend, React with Vite and Tailwind CSS for the frontend, and SQLite for storing the data. Start by setting up the project structure and then implement the application step by step. Keep the code clean and easy to understand, and make sure the frontend and backend work together properly.

Prompt 2 – Backend and database

Set up the backend APIs for the car dealership system. Create the necessary database models for users and vehicles, including vehicle make, model, category, price and quantity in stock. Implement the required endpoints for registration, login, listing vehicles, searching, updating vehicle details, deleting vehicles, purchasing vehicles and restocking inventory. Use proper validation and error handling, and make sure the data is stored persistently in the database.

Prompt 3 – Login and authentication

Implement user registration and login using JWT authentication. Passwords should be hashed before storing them, and protected endpoints should require a valid token. The application should support normal users and administrators, with admin-only actions restricted to admin accounts. Check the login and registration flow carefully and handle invalid credentials and expired tokens properly.

Prompt 4 – Vehicle inventory features

Implement the vehicle inventory functionality so users can browse available cars and search by make, model, category and price range. Administrators should be able to add new vehicles, update their details, delete vehicles and restock existing inventory. When a customer purchases a vehicle, the stock quantity should decrease correctly. Prevent purchases when stock is unavailable and make sure the quantity never becomes negative.

Prompt 5 – Frontend development

Build a modern and responsive React interface for the dealership system using Tailwind CSS. Include registration and login pages, a vehicle dashboard with car details, search and filter options, and a purchase button for each vehicle. Add an admin interface for managing inventory. Keep the design professional and easy to navigate, with proper loading indicators, error messages, empty states and success feedback.

Prompt 6 – Connecting frontend and backend

Connect the React frontend to the FastAPI backend using a shared API client. Make sure authentication tokens are sent with protected requests and that API responses are displayed correctly. Test the complete flow from registering and logging in to viewing vehicles, applying filters, purchasing a vehicle and performing admin operations. Avoid using hard-coded data or fake success messages where real API integration is required.

Prompt 7 – Writing tests

Add automated tests for the backend functionality before implementing or changing the relevant logic wherever possible. Cover registration, login, authentication, authorization, vehicle creation and updates, search filters, purchases, restocking, invalid inputs and insufficient stock. Add frontend tests for important user interactions as well. Fix any failures and run the test suites again, reporting the actual results rather than assuming the tests pass.

Prompt 8 – Fixing bugs and improving the code

Review the existing project and identify bugs, missing functionality and unnecessary duplication. Check whether the API validation, authentication, inventory calculations and frontend error handling work correctly. Fix issues without breaking existing features, and add regression tests for bugs that are discovered. Keep the changes focused and explain any important modifications.

Prompt 9 – Improving the UI

Review the current application interface and make it look more polished and consistent. Improve the vehicle cards, dashboard layout, forms, buttons, spacing, typography and responsive behavior. Make sure the application remains usable on mobile screens and that users can clearly understand whether an action succeeded or failed. Preserve the existing functionality while improving the design.

Prompt 10 – Final project review

Compare the completed project against every requirement in the original kata document. Check the backend endpoints, database persistence, authentication, admin permissions, inventory operations, frontend functionality, automated tests and project documentation. Run the available test suites and production build, identify anything still incomplete, and do not mark a requirement as completed without verifying it.