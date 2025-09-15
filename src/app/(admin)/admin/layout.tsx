import AdminNavbar from "@/components/admin/AdminNavbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminNavbar />
      {children}
    </div>
  );
}
