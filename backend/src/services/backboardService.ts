export async function searchByStyle(_query: string): Promise<string[]> {
  // TODO: Integrate with Backboard.io vector search
  console.log("Backboard searchByStyle called");
  return [];
}

export async function generateBBLink(
  _imageUrl: string,
  _title: string,
  _description: string
): Promise<string | null> {
  // TODO: Integrate with Backboard.io to generate a vector link
  console.log("Backboard generateBBLink called");
  return null;
}
