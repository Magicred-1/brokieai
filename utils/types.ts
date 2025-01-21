export type DBAgent = {
  id: string;
  name: string;
  active: boolean;
  configuration: {
    bio: string[];
    lore: string[];
    style: {
      all: string[];
      chat: string[];
      post: string[];
    };
    topics: string[];
    clients: string[];
    plugins: string[];
    settings: {
      voice: {
        model: string;
      };
      secrets: {
        SOLANA_CLUSTER: string;
        SOLANA_PUBLIC_KEY: string;
        SOLANA_PRIVATE_KEY: string;
      };
    };
    knowledge: string[];
    adjectives: string[];
    postExamples: string[];
    modelProvider: string;
    messageExamples: Array<
      [
        {
          user: string;
          content: {
            text: string;
          };
        },
        {
          user: string;
          content: {
            text: string;
          };
        }
      ]
    >;
  };
  owner: string;
  tokenAddress: string;
};

export type DBAgentList = {
  data: DBAgent[];
};
