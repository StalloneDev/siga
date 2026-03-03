import { getUsers } from "./actions";
import UsersClient from "./users-client";

export default async function UsersPage() {
    const initialUsers = await getUsers();

    return <UsersClient initialUsers={initialUsers} />;
}
