package com.mangalorehomes.propertyweb.catalog;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class PropertyAmenityLookup {
  @PersistenceContext private EntityManager em;

  @SuppressWarnings("unchecked")
  public List<String> amenityNamesForProperty(long propertyId) {
    var q =
        em.createNativeQuery(
            """
            select a.name from amenities a
            join property_amenities pa on pa.amenity_id = a.id
            where pa.property_id = ?1
            order by a.name
            """);
    q.setParameter(1, propertyId);
    List<?> raw = q.getResultList();
    var out = new ArrayList<String>();
    for (var o : raw) {
      if (o != null) out.add(o.toString());
    }
    return out;
  }
}
