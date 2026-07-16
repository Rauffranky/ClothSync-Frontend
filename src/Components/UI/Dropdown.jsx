import {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useDebouncedSearch } from "../../Hooks/useDebouncedSearch";

const getOptionLabel = (option, fallback) =>
  option?.selectedLabel ?? option?.label ?? fallback;

const Dropdown = ({
  options = [],
  multiple = false,
  value = multiple ? [] : null,
  onChange = () => {},
  disabled = false,
  search = false,
  placeholder = "Select option",
  label = null,
  name,
  width = "w-full",
  rounded = "12px",
  checkbox = false,
  showToggle = true,
  customTrigger = null,
  menuHeader = null,
  renderOption = null,
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  labelClassName = "",
  placeholderClassName = "",
  selectedValueClassName = "",
  triggerStyle,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) return value;
    return value !== null && value !== undefined ? [value] : [];
  }, [value]);

  const selectedSet = useMemo(
    () => new Set(selectedValues.map((item) => String(item))),
    [selectedValues],
  );

  const filteredOptions = useMemo(() => {
    const cleanQuery = debouncedQuery.toLowerCase();
    if (!cleanQuery) return options;

    return options.filter((option) =>
      String(option.searchLabel ?? option.label ?? option.value ?? "")
        .toLowerCase()
        .includes(cleanQuery),
    );
  }, [debouncedQuery, options]);

  const displayValue = useMemo(() => {
    if (multiple || value === null || value === undefined) return "";

    const selectedOption = options.find(
      (option) => String(option.value) === String(value),
    );

    return getOptionLabel(selectedOption, String(value));
  }, [multiple, options, value]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gutter = 8;
    const viewportPadding = 12;
    const estimatedHeight = Math.min(
      320,
      12 +
        (search ? 58 : 0) +
        (menuHeader ? 52 : 0) +
        Math.max(1, filteredOptions.length) * 44,
    );
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const shouldOpenUp =
      spaceBelow < estimatedHeight && rect.top > spaceBelow;
    const top = shouldOpenUp
      ? Math.max(viewportPadding, rect.top - estimatedHeight - gutter)
      : Math.min(rect.bottom + gutter, window.innerHeight - viewportPadding);

    setMenuPosition({
      top,
      left: Math.max(
        viewportPadding,
        Math.min(rect.left, window.innerWidth - rect.width - viewportPadding),
      ),
      width: rect.width,
      maxHeight: shouldOpenUp
        ? Math.max(180, rect.top - viewportPadding - gutter)
        : Math.max(180, window.innerHeight - rect.bottom - viewportPadding - gutter),
    });
  }, [filteredOptions.length, menuHeader, search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isInTrigger = wrapRef.current?.contains(target);
      const isInMenu = menuRef.current?.contains(target);

      if (!isInTrigger && !isInMenu) {
        setOpen(false);
        setMenuPosition(null);
        setActiveIndex(-1);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (open && search) {
      window.setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [open, search]);

  const closeDropdown = () => {
    setOpen(false);
    setMenuPosition(null);
    setActiveIndex(-1);
    setQuery("");
  };

  const commitChange = (nextValues) => {
    if (disabled) return;

    if (multiple) {
      onChange(Array.from(new Set(nextValues)));
      return;
    }

    onChange(nextValues.length ? nextValues[0] : null);
    closeDropdown();
  };

  const toggleValue = (nextValue) => {
    const nextValues = [...selectedValues];
    const selectedIndex = nextValues.findIndex(
      (item) => String(item) === String(nextValue),
    );

    if (selectedIndex >= 0) {
      nextValues.splice(selectedIndex, 1);
    } else {
      nextValues.push(nextValue);
    }

    commitChange(nextValues);
  };

  const scrollOptionIntoView = (index) => {
    window.requestAnimationFrame(() => {
      const list = listRef.current;
      const option = list?.querySelector(`[data-index="${index}"]`);
      if (!list || !option) return;

      const optionRect = option.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();

      if (optionRect.top < listRect.top) {
        list.scrollTop -= listRect.top - optionRect.top;
      }

      if (optionRect.bottom > listRect.bottom) {
        list.scrollTop += optionRect.bottom - listRect.bottom;
      }
    });
  };

  const handleKeyDown = (event) => {
    if (!open && ["ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      updateMenuPosition();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => {
        const nextIndex = Math.min(current + 1, filteredOptions.length - 1);
        scrollOptionIntoView(nextIndex);
        return nextIndex;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => {
        const nextIndex = Math.max(current < 0 ? filteredOptions.length - 1 : current - 1, 0);
        scrollOptionIntoView(nextIndex);
        return nextIndex;
      });
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option && !option.disabled) {
        multiple ? toggleValue(option.value) : commitChange([option.value]);
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }

    if (
      event.key === "Backspace" &&
      multiple &&
      !query &&
      selectedValues.length
    ) {
      commitChange(selectedValues.slice(0, -1));
    }
  };

  const renderChips = () => {
    if (!multiple || !selectedValues.length) return null;

    return (
      <div className="flex flex-wrap gap-1.5">
        {selectedValues.map((item) => {
          const selectedOption = options.find(
            (option) => String(option.value) === String(item),
          );
          const chipLabel = getOptionLabel(selectedOption, String(item));

          return (
            <span
              className="inline-flex max-w-40 items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold"
              key={String(item)}
              style={{
                color: "var(--color-aurora-teal)",
                background: "rgba(20, 184, 166, 0.12)",
                borderColor: "rgba(20, 184, 166, 0.22)",
              }}
            >
              <span className="truncate">{chipLabel}</span>
              {!disabled && (
                <button
                  aria-label={`Remove ${chipLabel}`}
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full border-0 bg-transparent p-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleValue(item);
                  }}
                  type="button"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`relative ${width} ${className}`}
      onKeyDown={handleKeyDown}
      ref={wrapRef}
    >
      {label && (
        <label
          className={`mb-2 block text-sm font-semibold ${labelClassName}`}
          style={{ color: "var(--theme-text-secondary)" }}
        >
          {label}
        </label>
      )}

      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
        data-state={open ? "open" : "closed"}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) {
            closeDropdown();
          } else {
            updateMenuPosition();
            setOpen(true);
          }
        }}
        style={{
          borderRadius: rounded,
          color: "var(--theme-text-primary)",
          background:
            "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
          border: `1px solid ${
            open ? "var(--color-aurora-teal)" : "var(--theme-border-soft)"
          }`,
          boxShadow: open
            ? "0 0 0 4px rgba(20, 184, 166, 0.14), 0 10px 22px rgba(20, 184, 166, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.18)"
            : "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
          ...triggerStyle,
        }}
        ref={triggerRef}
        type="button"
      >
        {customTrigger ? (
          customTrigger
        ) : (
          <div className="min-w-0 flex-1">
            {multiple ? (
              <>
                {renderChips()}
                {!selectedValues.length && (
                  <span
                    className={`block truncate ${placeholderClassName}`}
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {placeholder}
                  </span>
                )}
              </>
            ) : isValidElement(displayValue) ? (
              <div className={`truncate ${selectedValueClassName}`}>
                {displayValue}
              </div>
            ) : (
              <span
                className={`block truncate ${
                  displayValue ? selectedValueClassName : placeholderClassName
                }`}
                style={{
                  color: displayValue
                    ? "var(--theme-text-primary)"
                    : "var(--theme-text-muted)",
                }}
              >
                {displayValue || placeholder}
              </span>
            )}
          </div>
        )}

        {showToggle && (
          <ChevronDown
            className={`shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            size={18}
            strokeWidth={2.2}
            style={{ color: "var(--theme-text-muted)" }}
          />
        )}
      </button>

      {open &&
        menuPosition &&
        createPortal(
        <div
          aria-activedescendant={
            activeIndex >= 0 ? `dropdown-option-${activeIndex}` : undefined
          }
          className={`fixed z-1000 overflow-hidden rounded-xl border backdrop-blur-[18px] ${dropdownClassName}`}
          onKeyDown={handleKeyDown}
          ref={menuRef}
          role="listbox"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
            borderRadius: rounded,
            color: "var(--theme-text-primary)",
            background:
              "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
            borderColor: "var(--theme-border-soft)",
            boxShadow:
              "0 18px 46px rgba(0, 0, 0, 0.22), 0 0 24px rgba(20, 184, 166, 0.12)",
          }}
        >
          {search && (
            <div
              className="relative border-b p-2"
              style={{ borderColor: "var(--theme-border-soft)" }}
            >
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2"
                size={15}
                style={{ color: "var(--theme-text-muted)" }}
              />
              <input
                className="global-input-control h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 text-sm font-semibold outline-none placeholder:text-(--theme-text-muted)"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                ref={searchRef}
                style={{
                  color: "var(--theme-text-primary)",
                  borderColor: "var(--theme-border-soft)",
                }}
                type="text"
                value={query}
              />
            </div>
          )}

          {menuHeader && (
            <div
              className="border-b"
              style={{ borderColor: "var(--theme-border-soft)" }}
            >
              {menuHeader}
            </div>
          )}

          <ul
            className="hide-scrollbar overflow-auto p-1.5"
            ref={listRef}
            style={{ maxHeight: menuPosition.maxHeight - (search ? 58 : 0) }}
          >
            {!filteredOptions.length && (
              <li
                className="px-3 py-3 text-sm font-semibold"
                style={{ color: "var(--theme-text-muted)" }}
              >
                No results
              </li>
            )}

            {filteredOptions.map((option, index) => {
              const isSelected = selectedSet.has(String(option.value));
              const isActive = index === activeIndex;

              return (
                <li
                  aria-selected={isSelected}
                  className={`flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    option.disabled ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  data-index={index}
                  id={`dropdown-option-${index}`}
                  key={String(option.value)}
                  onClick={() => {
                    if (option.disabled) return;
                    multiple ? toggleValue(option.value) : commitChange([option.value]);
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  style={{
                    color: "var(--theme-text-primary)",
                    background:
                      isSelected || isActive
                        ? "rgba(20, 184, 166, 0.12)"
                        : "transparent",
                  }}
                >
                  {option.icon && (
                    <span className="shrink-0 text-(--color-aurora-teal)">
                      {option.icon}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    {typeof renderOption === "function" ? (
                      renderOption(option, { isSelected, isActive })
                    ) : (
                      <span className="block truncate">{option.label}</span>
                    )}
                  </div>

                  {checkbox && (
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full border"
                      style={{
                        color: isSelected ? "#ffffff" : "var(--color-aurora-teal)",
                        background: isSelected
                          ? "var(--gradient-aurora-flow)"
                          : "transparent",
                        borderColor: "rgba(20, 184, 166, 0.45)",
                      }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </span>
                  )}

                  {!checkbox && isSelected && (
                    <Check
                      className="shrink-0"
                      size={16}
                      strokeWidth={2.5}
                      style={{ color: "var(--color-aurora-teal)" }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>,
          document.body,
        )}

      {name && (
        <div className="hidden">
          {multiple
            ? selectedValues.map((item) => (
                <input key={String(item)} name={name} type="hidden" value={String(item)} />
              ))
            : value !== null &&
              value !== undefined && (
                <input name={name} type="hidden" value={String(value)} />
              )}
        </div>
      )}
    </div>
  );
};

export const SmartSelect = Dropdown;

export default Dropdown;
