package com.ahorrapp.repository;

import com.ahorrapp.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.user.id = :id")
    List<String> findDistinctCategoriesByUserId(Long id);


}
