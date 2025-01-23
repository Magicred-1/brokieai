import { createClient } from "@/utils/supabase";
import { DBAgentList } from "@/utils/types";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    user: string;
  }>;
};

function extractAgentDetails(responseJson: DBAgentList) {
  const data = responseJson.data || [];
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    walletAddress: item.tokenAddress,
  }));
}

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
    .eq("owner", user);

  const agents = supabaseData ? extractAgentDetails({ data: supabaseData }) : [];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: agents });
};
