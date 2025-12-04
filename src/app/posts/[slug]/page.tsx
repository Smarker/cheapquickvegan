// pages/posts/[slug].tsx
import { GetServerSideProps } from "next";

export default function LegacyPost() {
  // This page will never render anything
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Tell Google the page is gone permanently
  res.statusCode = 410;
  return { props: {} };
};
