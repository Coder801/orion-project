import { UserDetail } from "@/features/admin/users/UserDetail";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("adminUser");

export default async function AdminUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <UserDetail userId={id} />;
}
