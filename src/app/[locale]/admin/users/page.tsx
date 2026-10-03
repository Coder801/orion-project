import { UsersList } from "@/features/admin/users/UsersList";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("users");

export default function AdminUsersPage() {
    return (
        <Page pageKey="users">
            <UsersList />
        </Page>
    );
}
