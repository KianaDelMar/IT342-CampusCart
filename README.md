# CampusCart
An online marketplace designed to help students browse and manage campus-related products.

<br>

## ⚙️ Setup Instructions
### Frontend for Mobile Application (Kotlin)
##### 1. Clone the Repository
```
https://github.com/KianaDelMar/IT342-CampusCart.git
```
##### 2. Navigate to frontend_mobile Folder
```
cd frontend_mobile
```
##### 3. Open the frontend_mobile Folder in Android Studio

<br>

### Frontend for Web Application (ReactJs)
##### 1. Clone the Repository
```
https://github.com/KianaDelMar/IT342-CampusCart.git
```
> <i>Note: If cloning repository is already done, proceed to step 2.</i> <br>
##### 2. Navigate to frontend_web Folder
```
cd frontend_web
```
##### 3. Open the frontend_web Folder in your desired IDE (e.g. VSCode, IntelliJ, etc.)
##### 4. Open Terminal to install the dependencies
```
npm install
```
##### 5. Run the server
```
npm start
```

<br>

### Backend (Java SpringBoot)
##### 1. Clone the Repository
```
https://github.com/KianaDelMar/IT342-CampusCart.git
```
> <i>Note: If cloning repository is already done, proceed to step 2.</i> <br>
#### 2. Navigate to backend Folder
```
cd backend
```
#### 3. Open the frontend_web Folder in your desired IDE (e.g. VSCode, IntelliJ, etc.)
#### 4. Run the server

<br>

## 📋 Dependencies
### Mobile Application
```
dependencies {
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
    implementation(libs.androidx.core.ktx)
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-ktx:1.12.0")
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.cardview)
    implementation ("com.squareup.retrofit2:retrofit:2.9.0")
    implementation ("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
```

### Web Application
```
dependencies {
├── @babel/plugin-proposal-private-property-in-object@7.21.11
├── @emotion/react@11.13.5
├── @emotion/styled@11.13.5
├── @mui/icons-material@6.1.10
├── @mui/lab@6.0.0-beta.18
├── @mui/material@6.1.10
├── @mui/styled-engine-sc@6.1.9
├── @testing-library/jest-dom@6.6.3
├── @testing-library/react@16.0.1
├── @testing-library/user-event@14.5.2
├── axios@1.7.7
├── chart.js@4.4.7
├── react-chartjs-2@5.2.0
├── react-dom@18.3.1
├── react-hot-toast@2.4.1
├── react-router-dom@6.28.0
├── react-scripts@5.0.1
├── react@18.3.1
├── styled-components@6.1.13
├── web-vitals@4.2.4
└── xlsx@0.18.5
}
```

### Backend
```
<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>com.mysql</groupId>
			<artifactId>mysql-connector-j</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.1.0</version>
		</dependency>
	</dependencies>
```

<br>

---
## 🚀 Usage Guide
### Mobile
#### Run the App
##### 1. Connect a physical device or start an emulator
##### 2. Click the Run (▶️) button.
##### 3. The app should launch and display the Login Page.
```
app/
├── src/
│   └── main/
│       ├── java/edu/cit/campuscart/
│       │   ├── api/                # API service definitions
│       │   ├── models/             # Data models
│       │   ├── MainActivity.kt       # Login UI
│       └── res/
│           └── layout/             # XML layout files

```

### Web
#### Run the App
##### 1. Open Terminal:
```
npm start
```
##### 2. The app should launch and display the Login Page.
```
app/
├── src/
│   └── Pages/
│       └── LoginRegister/
│           └── AdminLogin.jsx
│           ├── Login.jsx          #Login Page
│           └── Register.jsx            

```

### Backend
#### Run the App
##### 1. Open Terminal and navigate to the backend project directory:
```
cd backend/
```
##### 2. Build and run the Spring Boot application by typing the following command in the terminal.
```
mvnw.cmd spring-boot:run

```
##### 3. The backend should now be running at.
```
http://localhost:8080

backend/
├── src/
│   └── main/
│       ├── java/edu/cit/campuscart/
│       │   ├── controller/         # Handles API requests
│       │   ├── service/            # Business logic layer
│       │   ├── entity/              # Data models / entities
│       │   └── CampuscartApplication.java  # Main entry point
│       └── resources/
│           └── application.properties      # App configurations

```
---
### Developers:
#### NAME: Kiana Marquisa S. Del Mar (Web Developer)
##### COURSE & YEAR: BSIT 3
I am Kiana Marquisa S. Del Mar, a `3rd year BSIT` student from `Cebu Institute of Technology - University`.
I currently live in Talisay City, but I am from Cebu City. My hobbies are reading, baking, listening to music, and watching movies or tv series.
I am an aspiring developer, the languages I currently work with are Java, C, JavaScript, PHP, HTML, Python. Coding.
Continuous learning is what I seek. <br>
<a href="https://github.com/KianaDelMar"><img src="https://img.shields.io/badge/GitHub-Profile-blueviolet?style=for-the-badge&logo=github&logoColor=white" alt="Kiana's GitHub"></a>

<br>

#### NAME: Karen Lean Kay Cabarrubias (Backend Developer)
##### COURSE & YEAR: BSIT 3
I am Karen Lean Kay Cabarrubias  a `3rd year BSIT` student from `Cebu Institute of Technology - University`. I am currently residing in Talisay City, Cebu. In my free time, I enjoy going on walks with my dogs. I aspire to be a developer that can help the community. I am a work in progress and I continue to learn as I live. <br>
<a href="https://github.com/Karyang1004"><img src="https://img.shields.io/badge/GitHub-Profile-blueviolet?style=for-the-badge&logo=github&logoColor=white" alt="Karen's GitHub"></a>

<br>

#### NAME: Chrizza Arnie T. Gales (Mobile Developer)
##### COURSE & YEAR: BSIT 3
I am Chrizza Arnie T. Gales, a `3rd year BSIT` student from `Cebu Institute of Technology - University`.
I currently live in Talisay City, Cebu. My hobbies are listening to music, reading manhwas, manhuas, and mangas, and watching movies or tv series.
I hope to become a developer in the future so I could help my family. To God be the Glory!<br>
<a href="https://github.com/Chizzwiz"><img src="https://img.shields.io/badge/GitHub-Profile-blueviolet?style=for-the-badge&logo=github&logoColor=white" alt="Chrizza's GitHub"></a>

---
## Top Contributors
<a href="https://github.com/KianaDelMar/IT342-CampusCart/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=eynabdllh/pet-adoption-system" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>
