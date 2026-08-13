"use client";

import type { PayloadClientReactComponent, RowLabelComponent } from "payload";

import { useRowLabel } from "@payloadcms/ui";
import React from "react";

const CustomRowLabelFooterColumns: PayloadClientReactComponent<
  RowLabelComponent
> = () => {
  const { data } = useRowLabel<{ label?: string }>();

  return data?.label || "Navigation group";
};

export default CustomRowLabelFooterColumns;
