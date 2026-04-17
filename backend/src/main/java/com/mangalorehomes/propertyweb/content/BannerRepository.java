package com.mangalorehomes.propertyweb.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannerRepository extends JpaRepository<BannerEntity, Long> {

  List<BannerEntity> findByPageTypeAndActiveIsTrueOrderByIdAsc(String pageType);
}
