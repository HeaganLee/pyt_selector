package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.SportsTeam;
import com.pyt.enums.ActiveStatus;

public interface SportsTeamRepository extends JpaRepository<SportsTeam, Long> {

    List<SportsTeam> findAllByOrderBySportTypeAscLeagueLevelTypeAscNameAsc();

    List<SportsTeam> findByActiveStatusOrderBySportTypeAscLeagueLevelTypeAscNameAsc(ActiveStatus activeStatus);
}
