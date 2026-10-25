# CarStock – Car Dealership Inventory System

CarStock is a full-stack web application developed for managing a car dealership's vehicle inventory. It allows users to register, log in, browse available vehicles, search for cars, and purchase vehicles based on their availability. Administrators can add new vehicles, update vehicle details, delete listings, and restock inventory.

The application was developed using Python, FastAPI, SQLAlchemy, SQLite, React, Vite, and Tailwind CSS. The backend provides REST API endpoints for authentication and inventory management, while the frontend provides a responsive interface for users and administrators. SQLite is used to store application data persistently, and JWT authentication is used to protect authorized operations.

The main features include user registration and login, vehicle listings, search and filtering by make, model, category, and price range, and inventory quantity tracking. The purchase button is disabled when a vehicle is out of stock. Administrative features include adding, editing, deleting, and restocking vehicles. The application also includes form validation, loading indicators, error messages, and confirmation dialogs.

## Running the Project Locally

To run the backend, make sure Python 3.11 or a compatible version is installed. Open a terminal in the project root and create a virtual environment using `py -m venv .venv`. Activate it with `.\.venv\Scripts\Activate.ps1` on Windows, then install the dependencies using `pip install -r backend/requirements.txt`. Start the FastAPI server using the command documented in the backend configuration, typically `uvicorn app.main:app --reload` from the backend directory. The API documentation can then be accessed at `http://127.0.0.1:8000/docs`.

The application uses SQLite for persistent data storage. If environment variables are required, configure them according to the backend settings before starting the server. Keep secret keys and local environment files out of the public repository.

To run the frontend, open another terminal and navigate to the `frontend` directory. Run `npm install` to install the dependencies and `npm run dev` to start the Vite development server. Open the local URL displayed in the terminal. Make sure the frontend API configuration points to the running backend server.

## API

The backend provides endpoints for registering and logging in users through `/api/auth/register` and `/api/auth/login`. Authenticated users can view and search vehicles through `/api/vehicles` and `/api/vehicles/search`. The API also supports creating vehicles, updating vehicle details, and purchasing vehicles. Deleting and restocking vehicles are restricted to administrators. Purchase operations update the available quantity, and vehicles cannot be purchased when the stock is insufficient.

## Screenshots

Screenshots of the application are included in the project to demonstrate the login screen, vehicle search, administrator dashboard, and add-vehicle form. These screenshots show the interface and some of the main application features.

## Testing

The project includes backend tests using `pytest` and frontend tests using Vitest and React Testing Library. To run the backend tests, activate the Python virtual environment and execute `pytest` from the backend directory. To run the frontend tests, navigate to the `frontend` directory and execute `npm test`. Run `npm run build` to check that the frontend production build completes successfully.

Test results and coverage figures should be updated using the actual output from the final test run. The project was reviewed and improved with attention to input validation, authentication, inventory operations, and maintainable code organization.

## My AI Usage

I used Manus to generate the initial version of the CarStock application, including the FastAPI backend, React frontend, initial tests, and interface design. I then used Claude to review the implementation against the assignment requirements and identify areas that needed improvement.

Claude helped me review authentication and inventory functionality, improve the backend structure, organize code into routes, services, and repositories, improve frontend interactions, and expand the automated tests. It also helped identify issues that required further checking, including an admin-login problem that was not caught by the initial tests.

Using AI tools helped speed up the initial development and made it easier to explore improvements and identify potential edge cases. However, the generated code and tests still required review and verification. This experience showed me that passing tests alone does not guarantee that every feature works correctly, and that understanding the implementation and testing the application behavior are important parts of development.

The initial implementation was generated with AI assistance and then reviewed and improved. The development process should not be described as strict test-driven development unless the Git commit history demonstrates the expected Red-Green-Refactor sequence.

## Repository

The project source code, backend and frontend tests, screenshots, and setup instructions are included in this repository. The repository link should be added here after the project has been pushed to GitHub.

