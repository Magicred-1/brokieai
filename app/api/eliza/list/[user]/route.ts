import { createClient } from "@/utils/supabase";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    user: string;
  }>;
};

export const GET = async (req: Request, { params }: Props) => {
  const { user } = await params;

  if (!user) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: supabaseData, error } = await supabase
    .from("configuration")
    .select("*")
    .eq("name", user); // adjust the filter to match the column to get only the agent from the user

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: supabaseData });
};
