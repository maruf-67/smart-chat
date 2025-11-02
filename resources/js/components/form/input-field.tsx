import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { type ChangeEvent, type ReactNode, useState } from 'react';

export type InputFieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'file'
    | 'image'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'tel'
    | 'url'
    | 'color'
    | 'search';

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface InputFieldProps {
    name: string;
    type: InputFieldType;
    label: string;
    value?: string | number | boolean | File | null;
    onChange?: (value: string | number | boolean | File | null) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    disabled?: boolean;
    className?: string;

    // Type-specific props
    options?: SelectOption[]; // for select, radio
    checkboxLabel?: string; // for checkbox
    accept?: string; // for file, image
    maxSize?: number; // for file, image (in bytes)
    rows?: number; // for textarea
    min?: number; // for number
    max?: number; // for number
    step?: number; // for number
    multiple?: boolean; // for select
    maxLength?: number; // for text inputs
}

export function InputField({
    name,
    type,
    label,
    value,
    onChange,
    error,
    required = false,
    placeholder,
    helpText,
    disabled = false,
    className = '',
    options = [],
    checkboxLabel,
    accept,
    maxSize = 2 * 1024 * 1024, // 2MB default
    rows = 4,
    min,
    max,
    step,
    maxLength,
}: InputFieldProps) {
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxSize) {
            alert(
                `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`,
            );
            e.target.value = '';
            return;
        }

        // Validate file type for images
        if (type === 'image' && !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            e.target.value = '';
            return;
        }

        setFileName(file.name);

        // Create preview for images
        if (type === 'image' && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }

        onChange?.(file);
    };

    const handleRemoveFile = () => {
        setFilePreview(null);
        setFileName(null);
        onChange?.(null);
    };

    const renderInput = (): ReactNode => {
        switch (type) {
            case 'textarea':
                return (
                    <Textarea
                        id={name}
                        name={name}
                        value={
                            typeof value === 'string' ||
                            typeof value === 'number'
                                ? value
                                : ''
                        }
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={rows}
                        maxLength={maxLength}
                        className={className}
                    />
                );

            case 'select':
                return (
                    <Select
                        name={name}
                        value={
                            typeof value === 'string' ||
                            typeof value === 'number'
                                ? value.toString()
                                : ''
                        }
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={className}>
                            <SelectValue
                                placeholder={placeholder || 'Select'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value.toString()}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={name}
                            name={name}
                            checked={!!value}
                            onCheckedChange={onChange}
                            disabled={disabled}
                        />
                        {checkboxLabel && (
                            <Label
                                htmlFor={name}
                                className="text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {checkboxLabel}
                            </Label>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="radio"
                                    id={`${name}-${option.value}`}
                                    name={name}
                                    value={option.value}
                                    checked={
                                        value?.toString() ===
                                        option.value.toString()
                                    }
                                    onChange={(e) => onChange?.(e.target.value)}
                                    disabled={disabled}
                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                                />
                                <Label
                                    htmlFor={`${name}-${option.value}`}
                                    className="text-sm leading-none font-normal"
                                >
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            case 'image':
                return (
                    <div className="space-y-4">
                        {(filePreview || value) && (
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage
                                        src={
                                            filePreview ||
                                            (typeof value === 'string'
                                                ? value.startsWith('http') ||
                                                  value.startsWith('/storage')
                                                    ? value
                                                    : `/storage/${value}`
                                                : '')
                                        }
                                        alt="Preview"
                                    />
                                    <AvatarFallback>
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={handleRemoveFile}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Input
                                id={name}
                                name={name}
                                type="file"
                                accept={accept || 'image/*'}
                                onChange={handleFileChange}
                                disabled={disabled}
                                className="hidden"
                            />
                            <Label
                                htmlFor={name}
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <Upload className="h-4 w-4" />
                                Choose File
                            </Label>
                            {fileName && (
                                <span className="text-sm text-muted-foreground">
                                    {fileName}
                                </span>
                            )}
                        </div>
                    </div>
                );

            case 'file':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Input
                                id={name}
                                name={name}
                                type="file"
                                accept={accept}
                                onChange={handleFileChange}
                                disabled={disabled}
                                className="hidden"
                            />
                            <Label
                                htmlFor={name}
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <Upload className="h-4 w-4" />
                                Choose File
                            </Label>
                            {fileName && (
                                <span className="text-sm text-muted-foreground">
                                    {fileName}
                                </span>
                            )}
                        </div>
                        {fileName && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="h-auto p-0 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Remove
                            </Button>
                        )}
                    </div>
                );

            case 'number':
                return (
                    <Input
                        id={name}
                        name={name}
                        type="number"
                        value={
                            typeof value === 'number' ||
                            typeof value === 'string'
                                ? value
                                : ''
                        }
                        onChange={(e) =>
                            onChange?.(
                                e.target.value === ''
                                    ? ''
                                    : parseFloat(e.target.value),
                            )
                        }
                        placeholder={placeholder}
                        disabled={disabled}
                        min={min}
                        max={max}
                        step={step}
                        className={className}
                    />
                );

            default:
                // text, email, password, date, datetime-local, tel, url, color, search
                return (
                    <Input
                        id={name}
                        name={name}
                        type={type}
                        value={
                            typeof value === 'string' ||
                            typeof value === 'number'
                                ? value
                                : ''
                        }
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        className={className}
                    />
                );
        }
    };

    // For checkbox type, render differently (no separate label)
    if (type === 'checkbox') {
        return (
            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    {label}
                    {required && (
                        <span className="ml-1 text-destructive">*</span>
                    )}
                </Label>
                {renderInput()}
                {error && <InputError message={error} />}
                {helpText && !error && (
                    <p className="text-sm text-muted-foreground">{helpText}</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {renderInput()}
            {error && <InputError message={error} />}
            {helpText && !error && (
                <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
        </div>
    );
}
