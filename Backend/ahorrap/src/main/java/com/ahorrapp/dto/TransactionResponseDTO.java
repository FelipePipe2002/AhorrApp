package com.ahorrapp.dto;

import com.ahorrapp.model.TransactionType;

import lombok.Data;

@Data
public class TransactionResponseDTO {
    private Long id;
    private TransactionType type;
    private String category;
    private Double amount;
    private String description;
    private String date;
    private Long userId;
}
