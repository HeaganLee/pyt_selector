package com.pyt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class PytBackApplication {

	public static void main(String[] args) {
		 Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        setIfPresent(dotenv, "DB_HOST");
        setIfPresent(dotenv, "DB_PORT");
        setIfPresent(dotenv, "DB_NAME");
        setIfPresent(dotenv, "DB_USER_NAME");
        setIfPresent(dotenv, "DB_PASSWORD");
		SpringApplication.run(PytBackApplication.class, args);
	}

    private static void setIfPresent(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value != null && !value.isBlank()) {
            System.setProperty(key, value);
        }
    }

}
