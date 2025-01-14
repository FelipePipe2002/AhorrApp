package com.ahorrapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AhorrapApplication {

	public static void main(String[] args) {
		SpringApplication.run(AhorrapApplication.class, args);
	}
	// add security for ip forwarding, like captcha to make an account and that
}
