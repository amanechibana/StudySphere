import Image from "next/image";

export default function SocialSignIn({ googleSignIn }: {
  googleSignIn: () => void;
}) {
  function handleGoogleSignIn() {
    googleSignIn();
  }

  return (
    <div className="flex rounded-full border-2 p-2 items-center justify-center gap-4 cursor-pointer hover:bg-zinc-300" onClick={() => handleGoogleSignIn()}>
      <Image
        width={32}
        height={32}
        alt="google signin"
        src="/Google_logo.webp"
      />
      Sign in with Google
    </div>
  );
}
