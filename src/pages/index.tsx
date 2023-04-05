import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import LoadingSpinner from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const [input, setInput] = useState("");
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    },
  });

  if (!user) return null;

  // console.log(user);

  return (
    <div className="flex w-full gap-4">
      <Image
        width={56}
        height={56}
        src={user.profileImageUrl}
        alt="Profile image"
        className="h-16 w-16 rounded-full"
      />
      <input
        placeholder="Type emojis"
        className="grow bg-transparent p-2 outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-4 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Profile image"
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <span className="font-bold">{`@${
            author.username ? author.username : "anonymus"
          }`}</span>
          <span>{`- ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>

        <p>{post.content}</p>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingSpinner size={60} />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div>
      {data?.map((post, i) => (
        <PostView {...post} key={post.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  //start fetching asap and reactQuery uses the cached data for all other requests of the same query
  api.posts.getAll.useQuery();

  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x md:max-w-2xl">
          <div className="flex justify-center border-b border-slate-400 p-4">
            {isSignedIn ? <CreatePostWizard /> : <SignInButton />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
