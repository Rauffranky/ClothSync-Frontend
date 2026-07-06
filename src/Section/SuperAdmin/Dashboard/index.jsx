import Badge from "../../../Components/UI/Badge";
import Card from "../../../Components/UI/Card";
import Table from "../../../Components/UI/Table";
const Dashboard = () => {
  const column = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      test: "test",
      test1: "test",
      test2: "test",
      test3: "test",
      status: (
        <Badge color="green" className="px-2 py-1 rounded">
          Active
        </Badge>
      ),
      actions: (
        <div className="flex space-x-2">

          <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            Edit
          </button>
        </div>
      ),
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      test: "test",
      test1: "test",
      test2: "test",
      test3: "test",
    },
    {
      id: 3,
      name: "Michael Johnson",
      email: "michael.johnson@example.com",
      role: "User",
      test: "test",
      test1: "test",
      test2: "test",
      test3: "test",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "User",
      test: "test",
      test1: "test",
      test2: "test",
      test3: "test",
    }
  ];

  return (
    <div>
      <Card>
        <h1 className="text-2xl font-bold text-(--color-aurora-teal)">
          Welcome to the Super Admin Dashboard
        </h1>
        <p className="text-(--color-aurora-teal) mt-2">
          This is the main dashboard for super administrators. Here you can
          manage users, view analytics, and access various administrative tools.
        </p>
      </Card>
      <Table data={column} />
    </div>
  );
};

export default Dashboard;
