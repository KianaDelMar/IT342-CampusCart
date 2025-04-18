plugins {
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.jetbrainsKotlinAndroid) apply false
}

buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.3.15") // or latest
    }
}