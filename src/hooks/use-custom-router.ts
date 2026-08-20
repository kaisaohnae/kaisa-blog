import {useRouter as useNextRouter, useSearchParams} from 'next/navigation';

/**
 * 자동으로 o와 a파라미터를 전달하고 있음
 */
const useRouter = () => {
  const {push: nextPush, ...rest} = useNextRouter();
  const searchParams = useSearchParams();

  const customPush = ({pathname, query}: {pathname: string; query: any}) => {
    if (!query) {
      query = {};
    }
    const orgNo = searchParams.get('o');
    if (orgNo) {
      query.o = orgNo; /*if (!orgNo) {  nextPush('/error?cd=not-org'); return {...rest, push: customPush}; }*/
    }
    const applyNo = searchParams.get('r');
    if (applyNo) {
      query.r = applyNo;
    }
    const generateQuery = new URLSearchParams(query).toString();
    nextPush(`${pathname}?${generateQuery}`);
  };
  return {...rest, push: customPush};
};

export {useRouter};
