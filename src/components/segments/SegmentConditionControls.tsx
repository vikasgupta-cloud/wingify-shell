// Shared attribute / operator / value controls used by Create custom segment
// (config) and Custom Logic (reports). Layout wrappers stay in each parent.

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ATTRIBUTE_CATEGORIES,
  findAttribute,
  findOperator,
  operatorsFor,
} from "../../config/segmentAttributes";
import type { SegmentCondition } from "../../config/segments";

export function SegmentValueField({
  condition,
  onChange,
}: {
  condition: SegmentCondition;
  onChange: (patch: Partial<SegmentCondition>) => void;
}) {
  const attr = findAttribute(condition.attribute);
  const op = attr ? findOperator(attr, condition.operator) : undefined;

  if (op?.valueless) return null;

  if (op?.valueType === "number") {
    return (
      <div className="flex flex-1 items-center gap-2">
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="0"
          className="h-9 w-full tabular-nums"
        />
        {op.valueSuffix && (
          <span className="shrink-0 text-sm text-muted-foreground">
            {op.valueSuffix}
          </span>
        )}
      </div>
    );
  }

  const vt = attr?.valueType;

  if (vt === "select") {
    return (
      <Select value={condition.value} onValueChange={(v) => onChange({ value: v })}>
        <SelectTrigger className="h-9 flex-1">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {(attr?.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (vt === "number") {
    return (
      <Input
        type="number"
        value={condition.value}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder="0"
        className="h-9 flex-1 tabular-nums"
      />
    );
  }

  return (
    <Input
      value={condition.value}
      onChange={(e) => onChange({ value: e.target.value })}
      placeholder="Value"
      className="h-9 flex-1"
    />
  );
}

/** Attribute (grouped) + operator + value — same fields as Create custom segment. */
export function SegmentConditionControls({
  condition,
  onChange,
  attributeWidthClassName = "w-[240px]",
}: {
  condition: SegmentCondition;
  onChange: (patch: Partial<SegmentCondition>) => void;
  attributeWidthClassName?: string;
}) {
  const attr = findAttribute(condition.attribute);
  const ops = attr ? operatorsFor(attr) : [];
  const op = (attr && findOperator(attr, condition.operator)) || ops[0];

  const changeAttribute = (newId: string) => {
    const newAttr = findAttribute(newId);
    onChange({
      attribute: newId,
      operator: newAttr ? operatorsFor(newAttr)[0].id : condition.operator,
      value: "",
    });
  };

  const changeOperator = (newId: string) => {
    const newOp = ops.find((o) => o.id === newId);
    onChange(newOp?.valueless ? { operator: newId, value: "" } : { operator: newId });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={condition.attribute} onValueChange={changeAttribute}>
        <SelectTrigger className={`h-9 shrink-0 ${attributeWidthClassName}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ATTRIBUTE_CATEGORIES.map((cat) => (
            <SelectGroup key={cat.id}>
              <SelectLabel>{cat.label}</SelectLabel>
              {cat.attributes.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.operator} onValueChange={changeOperator}>
        <SelectTrigger className="h-9 w-16 shrink-0" aria-label="Operator">
          <span className="w-6 text-center">{op?.symbol}</span>
        </SelectTrigger>
        <SelectContent>
          {ops.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              <span className="flex items-center">
                <span className="w-6 text-center">{o.symbol}</span>
                <span>{o.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <SegmentValueField condition={condition} onChange={onChange} />
    </div>
  );
}
