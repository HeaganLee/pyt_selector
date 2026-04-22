package com.pyt.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.CardProduct;

public interface CardProductRepository extends JpaRepository<CardProduct, Long> {

}
