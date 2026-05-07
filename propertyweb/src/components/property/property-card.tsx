import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@/lib/sample-data";
import { formatCompactINR } from "@/lib/format";
import { BedDouble, MapPin, Ruler, ShieldCheck, Star } from "lucide-react";

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0];
  const purpose = String(property.purpose ?? "").toLowerCase();
  const isRent = purpose === "rent";

  return (
    <Card className="group overflow-hidden border-muted/60 bg-card shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:ring-primary/15">
      <div className="relative aspect-16/10 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-[linear-gradient(90deg,var(--primary),var(--accent))] opacity-70" />
        <Image
          src={cover.url}
          alt={cover.alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/0 via-background/0 to-background/35 opacity-80" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-background/75 backdrop-blur">
            {isRent ? "Rent" : "Buy"}
          </Badge>
          {property.isFeatured ? (
            <Badge className="gap-1 bg-primary text-primary-foreground shadow-sm">
              <Star className="size-3" />
              Featured
            </Badge>
          ) : null}
          {property.isVerified ? (
            <Badge variant="outline" className="gap-1 bg-background/70">
              <ShieldCheck className="size-3" />
              Verified
            </Badge>
          ) : null}
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold leading-6 tracking-tight">
              {property.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <span className="line-clamp-1">
              {property.locality.name}, {property.locality.city}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tracking-tight">
              {formatCompactINR(property.price)}
              {isRent ? <span className="text-sm text-muted-foreground">/mo</span> : null}
            </div>
            <div className="text-xs text-muted-foreground">
              {property.propertyType.name}
              {property.furnishingStatus ? ` • ${property.furnishingStatus}` : ""}
            </div>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <Link href={`/property/${property.slug}`}>View</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {typeof property.bedrooms === "number" ? (
            <div className="flex items-center gap-1">
              <BedDouble className="size-4" />
              <span>{property.bedrooms} BHK</span>
            </div>
          ) : null}
          {typeof property.areaSqft === "number" ? (
            <div className="flex items-center gap-1">
              <Ruler className="size-4" />
              <span>{property.areaSqft} sqft</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

