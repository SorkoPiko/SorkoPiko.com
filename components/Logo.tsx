import Image from 'next/image';

export const Logo = ({ size }: { size: string }) => (
  <Image 
    src="/logo.gif"
    alt="Logo"
    width={Number(size)}
    height={Number(size)}
    priority={true}
    style={{ objectFit: 'contain' }}
  />
);