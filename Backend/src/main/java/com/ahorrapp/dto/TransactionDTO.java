package com.ahorrapp.dto;

import com.ahorrapp.model.TransactionType;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TransactionDTO {

    private Long id;

    @NotNull(message = "El tipo de transacción es obligatorio.")
    private TransactionType type;

    @NotBlank(message = "La categoría es obligatoria.")
    private String category;

    @NotNull(message = "El monto no puede estar vacío.")
    @Positive(message = "El monto debe ser mayor a 0.")
    private Double amount;

    private String description;

    @NotBlank(message = "La fecha es obligatoria.")
    private String date;

    private String image;

    @NotNull(message = "El ID del usuario es obligatorio.")
    private Long userId;
}
