import {  imageBase64 as LOWFRONTA} from "./__LOWFRONTA"
import {  imageBase64 as LOWFRONTI} from "./__LOWFRONTI"
import {  imageBase64 as LOWPOINTA} from "./__LOWPOINTA"
import {  imageBase64 as LOWPOINTI} from "./__LOWPOINTI"
import {  imageBase64 as LOWSPREADA} from "./__LOWSPREADA"
import {  imageBase64 as LOWSPREADI} from "./__LOWSPREADI"
import {  imageBase64 as MIDFRONTA} from "./__MIDFRONTA"
import {  imageBase64 as MIDFRONTI} from "./__MIDFRONTI"
import {  imageBase64 as MIDPOINTA} from "./__MIDPOINTA"
import {  imageBase64 as MIDPOINTI} from "./__MIDPOINTI"
import {  imageBase64 as MIDSPREADA} from "./__MIDSPREADA"
import {  imageBase64 as MIDSPREADI} from "./__MIDSPREADI"
import {  imageBase64 as POS1A} from "./__POS1A"
import {  imageBase64 as POS1I} from "./__POS1I"
import {  imageBase64 as POS2A} from "./__POS2A"
import {  imageBase64 as POS2I} from "./__POS2I"
import {  imageBase64 as POS3A} from "./__POS3A"
import {  imageBase64 as POS3I} from "./__POS3I"
import {  imageBase64 as POS_GRID} from "./__POS_GRID"
import {  imageBase64 as POS_LINEAR} from "./__POS_LINEAR"
import {  imageBase64 as UPFRONTA} from "./__UPFRONTA"
import {  imageBase64 as UPFRONTI} from "./__UPFRONTI"
import {  imageBase64 as UPPOINTA} from "./__UPPOINTA"
import {  imageBase64 as UPPOINTI} from "./__UPPOINTI"
import {  imageBase64 as UPSPREADA} from "./__UPSPREADA"
import {  imageBase64 as UPSPREADI} from "./__UPSPREADI"

export type ImageKey = "LOWFRONTA" |
	"LOWFRONTI" |
	"LOWPOINTA" |
	"LOWPOINTI" |
	"LOWSPREADA" |
	"LOWSPREADI" |
	"MIDFRONTA" |
	"MIDFRONTI" |
	"MIDPOINTA" |
	"MIDPOINTI" |
	"MIDSPREADA" |
	"MIDSPREADI" |
	"POS1A" |
	"POS1I" |
	"POS2A" |
	"POS2I" |
	"POS3A" |
	"POS3I" |
	"POS_GRID" |
	"POS_LINEAR" |
	"UPFRONTA" |
	"UPFRONTI" |
	"UPPOINTA" |
	"UPPOINTI" |
	"UPSPREADA" |
	"UPSPREADI"

export const images: {[key in ImageKey]: {fileName: string, imageBase64: string}} = {
    LOWFRONTA: { fileName: "LOWFRONTA.png", imageBase64: LOWFRONTA },
	LOWFRONTI: { fileName: "LOWFRONTI.png", imageBase64: LOWFRONTI },
	LOWPOINTA: { fileName: "LOWPOINTA.png", imageBase64: LOWPOINTA },
	LOWPOINTI: { fileName: "LOWPOINTI.png", imageBase64: LOWPOINTI },
	LOWSPREADA: { fileName: "LOWSPREADA.png", imageBase64: LOWSPREADA },
	LOWSPREADI: { fileName: "LOWSPREADI.png", imageBase64: LOWSPREADI },
	MIDFRONTA: { fileName: "MIDFRONTA.png", imageBase64: MIDFRONTA },
	MIDFRONTI: { fileName: "MIDFRONTI.png", imageBase64: MIDFRONTI },
	MIDPOINTA: { fileName: "MIDPOINTA.png", imageBase64: MIDPOINTA },
	MIDPOINTI: { fileName: "MIDPOINTI.png", imageBase64: MIDPOINTI },
	MIDSPREADA: { fileName: "MIDSPREADA.png", imageBase64: MIDSPREADA },
	MIDSPREADI: { fileName: "MIDSPREADI.png", imageBase64: MIDSPREADI },
	POS1A: { fileName: "POS1A.png", imageBase64: POS1A },
	POS1I: { fileName: "POS1I.png", imageBase64: POS1I },
	POS2A: { fileName: "POS2A.png", imageBase64: POS2A },
	POS2I: { fileName: "POS2I.png", imageBase64: POS2I },
	POS3A: { fileName: "POS3A.png", imageBase64: POS3A },
	POS3I: { fileName: "POS3I.png", imageBase64: POS3I },
	POS_GRID: { fileName: "POS_GRID.png", imageBase64: POS_GRID },
	POS_LINEAR: { fileName: "POS_LINEAR.png", imageBase64: POS_LINEAR },
	UPFRONTA: { fileName: "UPFRONTA.png", imageBase64: UPFRONTA },
	UPFRONTI: { fileName: "UPFRONTI.png", imageBase64: UPFRONTI },
	UPPOINTA: { fileName: "UPPOINTA.png", imageBase64: UPPOINTA },
	UPPOINTI: { fileName: "UPPOINTI.png", imageBase64: UPPOINTI },
	UPSPREADA: { fileName: "UPSPREADA.png", imageBase64: UPSPREADA },
	UPSPREADI: { fileName: "UPSPREADI.png", imageBase64: UPSPREADI }
}