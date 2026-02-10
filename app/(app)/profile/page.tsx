import { getProfile } from '@/actions/profile';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      <ProfileForm
        defaultValues={
          profile
            ? {
                age: profile.age,
                gender: profile.gender,
                height_cm: profile.height_cm,
                weight_kg: profile.weight_kg,
                activity_level: profile.activity_level,
                goal: profile.goal,
                athlete_mode: profile.athlete_mode,
              }
            : undefined
        }
      />
    </div>
  );
}
