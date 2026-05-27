import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("upload")
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(FileInterceptor("file", {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("Nenhum arquivo enviado!");
    }

    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      throw new BadRequestException("Apenas imagens são permitidas!");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    
    // Retorna a imagem codificada em Base64 para armazenamento persistente direto no banco de dados (ideal para Vercel Serverless)
    const base64Data = file.buffer.toString("base64");
    return {
      url: `data:${file.mimetype};base64,${base64Data}`,
    };
  }
}
