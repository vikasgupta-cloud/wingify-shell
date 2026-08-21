// Recommendation configure / edit surface inside DetailShell.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RecommendationLocation } from "@/data/recommendations";
import {
  useRecommendationRowsStore,
  useVisibleRecommendations,
} from "@/store/recommendationRows";

const LOCATIONS: RecommendationLocation[] = [
  "Home page",
  "Product page",
  "Cart pop-up",
  "Category page",
  "Checkout",
];

export default function RecommendationDetailPage() {
  const { entityId = "" } = useParams();
  const navigate = useNavigate();
  const rows = useVisibleRecommendations();
  const update = useRecommendationRowsStore((s) => s.update);
  const row = rows.find((r) => r.id === entityId);

  const [name, setName] = useState(row?.name ?? "");
  const [location, setLocation] = useState<RecommendationLocation>(
    row?.location ?? "Home page"
  );
  const [tags, setTags] = useState(row?.tags.join(", ") ?? "");

  useEffect(() => {
    if (!row) return;
    setName(row.name);
    setLocation(row.location);
    setTags(row.tags.join(", "));
  }, [row]);

  if (!row) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-12 text-center">
        <p className="text-sm font-medium text-foreground">
          Recommendation not found
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/commerce/recommendation")}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const save = () => {
    update(row.id, {
      name: name.trim() || row.name,
      location,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-12 py-10">
      <h1 className="text-lg font-medium text-foreground">
        Configure recommendation
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit the strategy details for #{row.id}.
      </p>

      <div className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reco-name">Recommendation name</Label>
          <Input
            id="reco-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Select
            value={location}
            onValueChange={(v) => setLocation(v as RecommendationLocation)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reco-tags">Tag(s)</Label>
          <Input
            id="reco-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated tags"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" onClick={save}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/commerce/recommendation")}
          >
            Back to list
          </Button>
        </div>
      </div>
    </div>
  );
}
