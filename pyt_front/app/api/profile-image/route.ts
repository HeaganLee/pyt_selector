import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: '업로드할 이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: '이미지 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: '프로필 이미지는 5MB 이하만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    const originalExtension = path.extname(file.name).toLowerCase();
    const extension = ALLOWED_EXTENSIONS.has(originalExtension)
      ? originalExtension
      : '.png';
    const fileName = `${crypto.randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    const uploadPath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      profileImageUrl: `/uploads/profiles/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '프로필 이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
