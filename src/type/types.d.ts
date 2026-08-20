/**
 * kaisa-blog API 서버의 Json 응답 타입
 */
interface JsonResponseType {
  success: boolean;
  message: string;
  code: number;
  list: any[];
  data: Record<string, unknown>;
}

interface OptionType {
  [key: string]: string;
}
