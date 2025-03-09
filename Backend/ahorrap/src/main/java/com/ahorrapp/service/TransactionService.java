package com.ahorrapp.service;

import com.ahorrapp.dto.TransactionDTO;
import com.ahorrapp.model.Transaction;
import com.ahorrapp.model.User;
import com.ahorrapp.repository.TransactionRepository;
import com.ahorrapp.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Transaction createTransaction(Transaction transaction, Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            transaction.setUser(userOptional.get());
            return transactionRepository.save(transaction);
        } else {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public ResponseEntity<Map<String, Object>> deleteTransaction(Long id, User user) {
        Optional<Transaction> transactionOptional = transactionRepository.findById(id);
        if (transactionOptional.isPresent()) {
            Transaction transaction = transactionOptional.get();
            if (transaction.getUser().getId().equals(user.getId())) {
                if(transaction.getImage() != null) {
                    String filename = String.format("image-%d-%d.jpg", user.getId(), id);
                    try {
                        Files.deleteIfExists(Paths.get("./ahorrapp-images/" + filename));
                    } catch (IOException e) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Error deleting image"));
                    }
                }
                transactionRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Transaction not found"));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Transaction not found"));
        }
    }

    public Transaction createTransaction(TransactionDTO transactionRequest, User user) {
        Transaction transaction = new Transaction();
        transaction.setType(transactionRequest.getType());
        transaction.setCategory(transactionRequest.getCategory());
        transaction.setAmount(transactionRequest.getAmount());
        transaction.setDescription(transactionRequest.getDescription());
        transaction.setDate(transactionRequest.getDate());
        transaction.setUser(user);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Guardar la imagen en el servidor
        String imagePath = null;
        if (transactionRequest.getImage() != null) {
            try {
                imagePath = saveImage(transactionRequest.getImage(), user.getId(), savedTransaction.getId());
            } catch (IOException e) {
                throw new RuntimeException("Error saving image", e);
            }
        }
        savedTransaction.setImage(imagePath);
        return transactionRepository.save(savedTransaction);
    }

    public List<String> getCategories(Long id) {
        return transactionRepository.findDistinctCategoriesByUserId(id);
    }

    public Transaction updateTransaction(TransactionDTO transactionRequest, User user) throws IOException {
        Optional<Transaction> transactionOptional = transactionRepository.findById(transactionRequest.getId());
        if (transactionOptional.isPresent()) {
            Transaction transaction = transactionOptional.get();
            if (transaction.getUser().getId().equals(user.getId())) { // como no va a pasar que se agrega una imagen cuando hay otra imagen, se puede agregar sin problemas
                if (transactionRequest.getImage() != null) {
                    try {
                        String newImagePath = saveImage(transactionRequest.getImage(), user.getId(),
                                transaction.getId());
                        transaction.setImage(newImagePath);
                    } catch (IOException e) {
                        throw new RuntimeException("Error saving new image", e);
                    }
                } else {
                    if (transaction.getImage() != null) {
                        String filename = String.format("image-%d-%d.jpg", transactionRequest.getUserId(), transactionRequest.getId());
                        Files.deleteIfExists(Paths.get("./ahorrapp-images/" + filename));
                        transaction.setImage(null);
                    }
                }
                transaction.setType(transactionRequest.getType());
                transaction.setCategory(transactionRequest.getCategory());
                transaction.setAmount(transactionRequest.getAmount());
                transaction.setDescription(transactionRequest.getDescription());
                transaction.setDate(transactionRequest.getDate());
                return transactionRepository.save(transaction);
            } else {
                throw new IllegalArgumentException("Unauthorized transaction update");
            }
        } else {
            throw new IllegalArgumentException("Transaction not found");
        }
    }

    private String saveImage(String base64Image, Long userId, Long transactionId) throws IOException {
        if (base64Image == null || base64Image.isEmpty()) {
            return null;
        }

        System.out.println(base64Image);

        String directoryPath = "./ahorrapp-images/";
        Files.createDirectories(Paths.get(directoryPath));

        // Guardar archivo
        String filename = String.format("image-%d-%d.txt", userId, transactionId);
        Path imagePath = Paths.get(directoryPath + filename);
        Files.writeString(imagePath, base64Image);

        return filename;
    }

    public void changeCategories(Long id, String newCategory, List<String> oldCategories) {
        transactionRepository.changeCategories(id, newCategory, oldCategories);
    }


}
