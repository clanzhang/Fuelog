import RecognizeHeader from './RecognizeHeader'
import RecognizeImageArea from './RecognizeImageArea'
import RecognizeControls from './RecognizeControls'
import RecognizeFileInputs from './RecognizeFileInputs'
import useRecognize from '../hooks/useRecognize'

/**
 * AI 食物识别页（组合组件）
 * 内部调用 useRecognize Hook 管理全流程状态，
 * 组合 文件输入 / 顶部栏 / 图片区 / 底部控制区。
 */
export default function RecognizeScreen() {
  const {
    cameraRef,
    galleryRef,
    status,
    originalImage,
    result,
    errorMsg,
    mealType,
    date,
    saving,
    editedKeys,
    wechat,
    handleLocalPick,
    onFieldChange,
    onEditCalories,
    onEditNutrition,
    onMealTypeChange,
    onDateChange,
    onSave,
    onCancel,
    onManual,
    onRetry,
  } = useRecognize()

  return (
    <div className="flex h-full flex-col bg-[#1E1E2E]">
      {/* 兜底拍照/相册 input（无 state 直接访问时使用） */}
      <RecognizeFileInputs
        cameraRef={cameraRef}
        galleryRef={galleryRef}
        onPick={handleLocalPick}
      />

      {/* 顶部栏 */}
      <RecognizeHeader onBack={onCancel} />

      {/* 图片区域 */}
      <RecognizeImageArea
        originalImage={originalImage}
        status={status}
        result={result}
        wechat={wechat}
        onCamera={() => cameraRef.current?.click()}
        onGallery={() => galleryRef.current?.click()}
      />

      {/* 底部控制区 */}
      <RecognizeControls
        status={status}
        result={result}
        errorMsg={errorMsg}
        editedKeys={editedKeys}
        mealType={mealType}
        date={date}
        saving={saving}
        onFieldChange={onFieldChange}
        onEditCalories={onEditCalories}
        onEditNutrition={onEditNutrition}
        onMealTypeChange={onMealTypeChange}
        onDateChange={onDateChange}
        onCancel={onCancel}
        onSave={onSave}
        onManual={onManual}
        onRetry={onRetry}
      />
    </div>
  )
}
