/**
 * 숫자만 입력하게 제한하는 함수
 *
 * @param value 입력값
 * @returns 숫자만 포함된 문자열
 */
export const restrictNumeric = (value: string): string => {
  if (/^\d*$/.test(value)) {
    return value;
  }
  return value.replace(/\D/g, '');
};

/**
 * 공백 및 특수문자 입력 제한 함수
 * @param value
 * @returns 한글, 숫자, 영문만 포함된 문자열
 */
export const restrictSpecialCharacters = (value: string): string => {
  return value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g, '');
};

/**
 * 이름 중간 공백 허용 유효성 체크 시 사용
 * @param value
 */
export const restrictNameWithSpace = (value: string): string => {
  return value.trim();
};

/**
 * 숫자와 하나의 하이픈('-')만 입력하게 제한하는 함수
 *
 * @param value 입력값
 * @returns 숫자와 하나의 하이픈만 포함된 문자열
 */
export const restrictNumericWithDash = (value: string): string => {
  // 숫자와 하이픈만 남기고 제거
  const filteredValue = value.replace(/[^0-9-]/g, '');

  // 연속된 하이픈 제거
  return filteredValue.replace(/-+/g, '-');
};

/**
 * 비밀번호 영문 대소문자, 숫자, 특수문자 중 2가지 이상 조합
 * @param value
 */
export const isValidPassword = (value: string): boolean => {
  const num = /[0-9]/g.test(value) ? 1 : 0;
  const eng = /[a-zA-Z]/g.test(value) ? 1 : 0;
  const spe = /[!@#$%^&*()\-_=+\\|\[\]{};:'",.<>\/?]/g.test(value) ? 1 : 0;
  return num + eng + spe >= 2;
};

/**
 * 이메일 형식으로 입력하게 제한하는 함수
 *
 * @param value 입력값
 * @returns 이메일 형식이면 true
 */
export const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const regex = /^(010|999)(-?\d{3,4})-?\d{4}$/;
  return regex.test(phoneNumber);
};

/**
 * 사용자가 첨부한 파일 유효성 검사
 *
 * @param file File 객체
 * @param verifyExt 허용할 확장자 string 배열
 * @param maxSize 최대 허용 가능한 용량(단위는 바이트)
 * @param invalidHandler
 * @param notAllowedExtMsg
 */
export const isValidFile = ({
                              file,
                              verifyExt = ['.jpg', '.png', '.gif', '.jpeg'],
                              maxSize = 10485760,
                              invalidHandler,
                              notAllowedExtMsg = '허용되지 않는 확장자입니다.'
                            }: {
  file: File;
  verifyExt?: string[];
  maxSize?: number;
  invalidHandler?: () => void;
  notAllowedExtMsg?: string;
}) => {
  if (verifyExt.indexOf(file.name.substring(file.name.lastIndexOf('.')).toLowerCase()) === -1) {
    alert(notAllowedExtMsg);
    invalidHandler?.();
    return false;
  }
  if (maxSize < file.size) {
    alert('등록 가능한 파일 크기를 초과하였습니다.');
    invalidHandler?.();
    return false;
  }
  return true;
};
