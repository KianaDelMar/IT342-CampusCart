package edu.cit.campuscart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	@Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow all paths
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);  // Allow credentials if needed (cookies, authorization headers)
    }
    
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
	    String path = "C:/Users/Lloyd/Downloads/uploads/";
	    
	    registry.addResourceHandler("/uploads/**")
	            .addResourceLocations("file:///" + path.replace("\\", "/")); 
	}

}
