import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="p-4 flex justify-center">
      <UserProfile routing="hash" />
    </div>
  );
}
