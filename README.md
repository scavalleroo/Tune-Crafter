Tune-Crafter
============

Welcome to the Tune-Crafter project! This project is part of the HCI909 - Advanced Programming of Interactive Systems (D4INH09) course, focusing on modern UI toolkits and interfaces.

Table of Contents
-----------------
1. Introduction
2. Getting Started
    - Prerequisites
    - Installation
    - Running the Project
3. Project Structure
4. Contributing
5. Team Members
6. Acknowledgments

Introduction
------------
Tune-Crafter is an innovative web application designed to provide users with an interactive experience in crafting tunes. Dive in to explore the power and flexibility of modern UI toolkits!

Getting Started
---------------
To set up and run this project locally, follow the steps below.

### Prerequisites
Ensure you have the following installed on your system:
- Node.js and npm (The Node.js package manager)

### Installation
1. **Clone the Repository**
   ```
   git clone [repository-url]
   cd Tune-Crafter
   ```

2. **Install Dependencies**
   ```
   npm install
   ```


### Setup Guide


Project Setup Guide
===================

1. Configuring the Server
-------------------------
1. **Setting the IP Address**
    - Open the `.env` file.
    - Set the IP address of the machine:
      ```
      VITE_IP_ADDRESS_SERVER_SOCKET=10.245.217.76
      VITE_PORT_SERVER_SOCKET=3000
      ```

2. **Running the Python Server**
    - Navigate to the `server` folder.
    - Install the required Python libraries:
      ```bash
      pip install socketio eventlet
      ```
    - Note: The exact library names can be confirmed by looking inside the `socket` folder.
    - Run the Python server:
      ```bash
      python socket_server.py
      ```
    - Note: Ensure you have Python 3 installed.

3. **Running the Web Application**
    - Install the required Node.js dependencies:
      ```bash
      npm install
      ```
    - Build the application:
      ```bash
      npm run build
      ```
    - Start the development server:
      ```bash
      npm run dev
      ```

2. Setting Up the Android Application
-------------------------------------
1. **Configuring the IP Address**
    - Open the `strings.xml` resource file.
    - Look for the variable that contains the IP address.
    - Set it to the same IP address as specified in the `.env` file.

2. **Setting Up the Wear OS App**
    - Open the project in Android Studio.
    - Synchronize the `build.gradle` file.
    - For testing the application on a smartwatch:
        - Install the Wear OS app on the watch.
        - Ensure you've set the correct IP address and port.
    - Finally, run the application on the smartwatch.

### Running the Project
Start the development server:
```
npm run dev
```
This will start the application in development mode.

Project Structure
-----------------
- **src/**: Contains the source code of the application.
- **public/**: Houses static assets required by the project.
- **dist/**: The built project files are stored here after compilation.
- **node_modules/**: All the project dependencies.

For more detailed information on the project's architecture and components, refer to the inline comments within the source files.

Contributing
------------
While this project is primarily for educational purposes, contributions are always welcome! If you find a bug or have a feature request, feel free to open an issue or submit a pull request.

Team Members
------------
- Alessandro Cavallotti
- Matteo Fornara
- Shubhankar

Acknowledgments
---------------
A big thank you to the HCI909 - Advanced Programming of Interactive Systems (D4INH09) course instructors and participants for their invaluable insights and feedback throughout the project's development.