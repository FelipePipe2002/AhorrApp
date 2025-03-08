package com.ahorrapp.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

import com.ahorrapp.dto.TransactionDTO;
import com.ahorrapp.dto.UserResponseDTO;
import com.ahorrapp.model.Transaction;
import com.ahorrapp.model.User;

public class mapperDTOModel {

    public static UserResponseDTO mapToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setLastname(user.getLastname());
        dto.setEmail(user.getEmail());
        return dto;
    }

    public static TransactionDTO mapToResponseDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setCategory(transaction.getCategory());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setDate(transaction.getDate());
        dto.setImage(loadImageAsBase64(transaction.getImage()));
        dto.setUserId(transaction.getUser().getId());
        return dto;
    }

    private static String loadImageAsBase64(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return null;
        }

        try {
            Path path = Paths.get("./ahorrapp-images/" + imagePath);
            byte[] imageBytes = Files.readAllBytes(path);
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (IOException e) {
            return null; // Si la imagen no existe, devolvemos null
        }
    }

}
