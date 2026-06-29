package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.CardCompany;

public interface CardCompanyRepository extends JpaRepository<CardCompany, Long> {

    List<CardCompany> findAllByOrderByNameAsc();
}
