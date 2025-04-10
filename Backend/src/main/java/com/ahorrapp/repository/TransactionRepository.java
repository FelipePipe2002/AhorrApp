package com.ahorrapp.repository;

import com.ahorrapp.model.Transaction;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.user.id = :id")
    List<String> findDistinctCategoriesByUserId(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Transaction t SET t.category = :newCategory WHERE t.user.id = :id AND t.category IN :oldCategories")
    void changeCategories(@Param("id") Long id, @Param("newCategory") String newCategory,
            @Param("oldCategories") List<String> oldCategories);

}
